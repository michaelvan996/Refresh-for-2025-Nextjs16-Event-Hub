import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Types } from 'mongoose';

import connectDB from '@/lib/mongodb';
import Event, { type Event as EventDocument } from '@/database/event.model';
import { mapMongoError, type ApiError } from '@/lib/mongoErrorMapper';

type ErrorResponse = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

type EventResponse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type CreateEventInput = {
  title: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  organizer: string;
  agenda: string[];
  tags: string[];
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

/**
 * Create a JSON HTTP error response.
 *
 * @param status - The HTTP status code to send
 * @param body - The error payload to include in the response
 * @returns A NextResponse containing the JSON error body with the given HTTP status
 */
function jsonError(status: number, body: ErrorResponse): NextResponse {
  return NextResponse.json(body, { status });
}

/**
 * Convert an Event MongoDB document into the API-facing EventResponse shape.
 *
 * @param doc - The Event document from the database
 * @returns The event formatted for API responses with `id` as a string and `createdAt`/`updatedAt` as ISO timestamp strings
 */
function toEventResponse(doc: EventDocument): EventResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    overview: doc.overview,
    image: doc.image,
    venue: doc.venue,
    location: doc.location,
    date: doc.date,
    time: doc.time,
    mode: doc.mode,
    audience: doc.audience,
    agenda: doc.agenda,
    organizer: doc.organizer,
    tags: doc.tags,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Get a trimmed string value for a form field or an empty string if the field is missing or not a string.
 *
 * @param formData - The FormData object to read from
 * @param key - The form field name to retrieve
 * @returns The trimmed string value for `key`, or an empty string if absent or not a string
 */
function getFormString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Parses one or more string values for a form field into a normalized array of strings.
 *
 * Supports multiple form fields with the same key, a JSON array string (e.g. `["a","b"]`),
 * or a comma-separated string; trims items and filters out empty entries.
 *
 * @param formData - The FormData to read values from
 * @param key - The form field name to extract
 * @returns An array of trimmed, non-empty strings parsed from the field, or an empty array if none
 */
function getFormStringArray(formData: FormData, key: string): string[] {
  const all = formData.getAll(key);

  const items: string[] = [];
  if (all.length > 1) {
    for (const v of all) {
      if (typeof v === 'string') items.push(v.trim());
    }
    return items.filter(Boolean);
  }

  const single = all[0];
  if (typeof single !== 'string') return [];

  const trimmed = single.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return [trimmed];
}

/**
 * Validates that all required event creation fields are present and that `agenda` and `tags` each contain at least one item.
 *
 * @param input - The create-event payload to validate.
 * @returns `{ ok: true }` when validation passes; otherwise `{ ok: false; response: NextResponse }` where `response` is a 400 Bad Request JSON describing the validation errors (missing fields or empty `agenda`/`tags`).
 */
function validateCreateEventInput(input: CreateEventInput): { ok: true } | { ok: false; response: NextResponse } {
  const required: Array<keyof CreateEventInput> = [
    'title',
    'description',
    'overview',
    'venue',
    'location',
    'date',
    'time',
    'mode',
    'audience',
    'organizer',
  ];

  const missing = required.filter((k) => !input[k]);
  if (missing.length) {
    return {
      ok: false,
      response: jsonError(400, {
        message: `Missing required field(s): ${missing.join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: { missing },
      }),
    };
  }

  if (!Array.isArray(input.agenda) || input.agenda.length === 0) {
    return {
      ok: false,
      response: jsonError(400, {
        message: 'Agenda must contain at least one item',
        code: 'VALIDATION_ERROR',
        details: { field: 'agenda' },
      }),
    };
  }

  if (!Array.isArray(input.tags) || input.tags.length === 0) {
    return {
      ok: false,
      response: jsonError(400, {
        message: 'Tags must contain at least one item',
        code: 'VALIDATION_ERROR',
        details: { field: 'tags' },
      }),
    };
  }

  return { ok: true };
}

/**
 * Uploads an image file to Cloudinary (stored under the "DevEvent" folder) and returns its upload identifiers.
 *
 * @param file - The image File (e.g., from FormData) to upload
 * @returns An object with `secure_url` (public HTTPS URL) and `public_id` (Cloudinary asset id)
 * @throws Error if the upload fails or Cloudinary returns no result
 */
async function uploadEventImage(file: File): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload returned no result'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      })
      .end(buffer);
  });
}

/**
 * Handle creation of a new event from multipart/form-data: validates input, checks for duplicates,
 * uploads the event image to Cloudinary, creates the event in the database, and returns the created event or a structured error response.
 *
 * The handler performs a preflight duplicate check by title/date/time/venue before uploading the image,
 * and attempts a best-effort rollback (deleting the uploaded image) if database write fails.
 *
 * @returns A NextResponse containing either:
 *  - a 201 success payload with the created event, or
 *  - a structured error payload with an appropriate HTTP status (validation errors, missing image, duplicate event, upload failure, database errors, or internal server error).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const formData = await req.formData();

    const file = formData.get('image');
    if (!(file instanceof File)) {
      return jsonError(400, { message: 'Image file is required', code: 'MISSING_IMAGE' });
    }

    let tags = JSON.parse(formData.get('tags') as string);
    let agenda = JSON.parse(formData.get('agenda') as string);

    const input: CreateEventInput = {
      title: getFormString(formData, 'title'),
      description: getFormString(formData, 'description'),
      overview: getFormString(formData, 'overview'),
      venue: getFormString(formData, 'venue'),
      location: getFormString(formData, 'location'),
      date: getFormString(formData, 'date'),
      time: getFormString(formData, 'time'),
      mode: getFormString(formData, 'mode'),
      audience: getFormString(formData, 'audience'),
      organizer: getFormString(formData, 'organizer'),
      agenda: getFormStringArray(formData, 'agenda'),
      tags: getFormStringArray(formData, 'tags'),
    };

    const validation = validateCreateEventInput(input);
    if (!validation.ok) return validation.response;

    // Preflight duplicate check before uploading image to save bandwidth/cost.
    const existing = await Event.findOne({
      title: input.title,
      date: input.date,
      time: input.time,
      venue: input.venue,
    })
      .select('_id slug')
      .lean<{ _id: Types.ObjectId; slug: string }>()
      .exec();

    if (existing) {
      return NextResponse.json(
        {
          message: 'An event with the same title, date, time, and venue already exists',
          code: 'DUPLICATE_EVENT',
          fields: ['title', 'date', 'time', 'venue'],
          existing: { id: existing._id.toString(), slug: existing.slug },
        },
        { status: 409 }
      );
    }

    let uploaded: CloudinaryUploadResult | null = null;
    try {
      uploaded = await uploadEventImage(file);
    } catch (err: unknown) {
      const mapped: ApiError | null = mapMongoError(err);
      if (mapped) return NextResponse.json(mapped.body, { status: mapped.status });

      const message = err instanceof Error ? err.message : 'Unknown error';
      return jsonError(502, { message: 'Image upload failed', code: 'UPLOAD_ERROR', details: { error: message } });
    }

    try {
      const created = await Event.create({
          ...input,
          image: uploaded.secure_url,
          tags: tags,
          agenda: agenda});
      return NextResponse.json(
        {
          message: 'Event created successfully',
          event: toEventResponse(created),
        },
        { status: 201 }
      );
    } catch (err: unknown) {
      // Best-effort rollback: delete uploaded asset if DB write fails.
      try {
        await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'image' });
      } catch {
        // ignore rollback failures
      }

      const mapped: ApiError | null = mapMongoError(err);
      if (mapped) return NextResponse.json(mapped.body, { status: mapped.status });

      throw err;
    }
  } catch (err: unknown) {
    const mapped: ApiError | null = mapMongoError(err);
    if (mapped) return NextResponse.json(mapped.body, { status: mapped.status });

    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/events failed:', err);
    return jsonError(500, { message: 'Event creation failed', code: 'INTERNAL_SERVER_ERROR', details: { error: message } });
  }
}

/**
 * Fetches all events from the database and returns them in a JSON API response.
 *
 * @returns A NextResponse containing `{ message: string, events: EventResponse[] }` with status 200 on success; on failure returns a JSON error payload with an appropriate HTTP status code and error details.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    const docs = await Event.find().sort({ createdAt: -1 }).select('-__v').exec();
    const events = docs.map(toEventResponse);

    return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
  } catch (err: unknown) {
    const mapped: ApiError | null = mapMongoError(err);
    if (mapped) return NextResponse.json(mapped.body, { status: mapped.status });

    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/events failed:', err);
    return jsonError(500, { message: 'Event fetching failed', code: 'INTERNAL_SERVER_ERROR', details: { error: message } });
  }
}