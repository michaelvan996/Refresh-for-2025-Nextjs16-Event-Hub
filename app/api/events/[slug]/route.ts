import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Event, { type Event as EventDocument } from '@/database/event.model';
import { mapMongoError, type ApiError } from '@/lib/mongoErrorMapper';

type RouteContext = {
  // Next.js (current version) provides params as an async value in generated route types.
  params: Promise<{
    slug: string;
  }>;
};

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

function jsonError(status: number, body: ErrorResponse): NextResponse {
  return NextResponse.json(body, { status });
}

/**
 * Validates and normalizes a slug route param.
 * - Ensures it is present and URL-decodable
 * - Normalizes to lowercase
 * - Restricts to a conservative slug charset for safety
 */
function parseSlug(input: string | undefined): { ok: true; slug: string } | { ok: false; response: NextResponse } {
  if (!input) {
    return {
      ok: false,
      response: jsonError(400, { message: 'Missing required route parameter: slug', code: 'MISSING_SLUG' }),
    };
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    return {
      ok: false,
      response: jsonError(400, { message: 'Invalid slug encoding', code: 'INVALID_SLUG' }),
    };
  }

  const slug = decoded.trim().toLowerCase();

  // Allow typical URL slugs: a-z, 0-9, hyphen; no leading/trailing hyphen.
  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      response: jsonError(400, {
        message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
        code: 'INVALID_SLUG',
      }),
    };
  }

  if (slug.length > 200) {
    return {
      ok: false,
      response: jsonError(400, { message: 'Slug is too long', code: 'INVALID_SLUG' }),
    };
  }

  return { ok: true, slug };
}

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

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed.ok) return parsed.response;

  try {
    await connectDB();

    // Use .exec() for consistent, fully-typed mongoose promises.
    const eventDoc = await Event.findOne({ slug: parsed.slug }).select('-__v').exec();

    if (!eventDoc) {
      return jsonError(404, {
        message: `Event not found for slug: ${parsed.slug}`,
        code: 'EVENT_NOT_FOUND',
      });
    }

    return NextResponse.json(
      {
        message: 'Event fetched successfully',
        event: toEventResponse(eventDoc),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // Reuse existing mapping for known Mongo/Mongoose error shapes.
    const mapped: ApiError | null = mapMongoError(err);
    if (mapped) {
      return NextResponse.json(mapped.body, { status: mapped.status });
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/events/[slug] failed:', err);

    return jsonError(500, {
      message: 'Failed to fetch event',
      code: 'INTERNAL_SERVER_ERROR',
      details: { error: message },
    });
  }
}
