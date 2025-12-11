import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface Event extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<Event>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index on slug for faster queries
EventSchema.index({ slug: 1 });

/**
 * Pre-save hook to generate slug, normalize date and time
 * Only regenerates slug if title has changed
 */
EventSchema.pre('save', async function () {
  // Generate slug from title if title is modified or new document
  if (this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();

    // Ensure slug uniqueness by checking existing slugs in the collection
    const Model = this.constructor as any;
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escaped = escapeRegex(baseSlug);
    const pattern = new RegExp(`^${escaped}(?:-\\d+)?$`, 'i');

    const query: any = { slug: pattern };
    if ((this as any)._id) {
      query._id = { $ne: (this as any)._id };
    }

    const existing: Array<{ slug: string }> = await Model.find(query)
      .select('slug')
      .lean();

    // Decide on suffix
    let hasBase = false;
    let maxSuffix = 0;
    const suffixRe = new RegExp(`^${escaped}-(\\d+)$`, 'i');
    for (const doc of existing) {
      const s = (doc.slug || '').toLowerCase();
      if (s === baseSlug) {
        hasBase = true;
        continue;
      }
      const m = s.match(suffixRe);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > maxSuffix) maxSuffix = n;
      }
    }

    const nextNum = hasBase ? maxSuffix + 1 : 0;
    this.slug = nextNum === 0 ? baseSlug : `${baseSlug}-${nextNum}`;
  }

  // Normalize date to ISO format if date is modified
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Date must be a valid date format');
    }
    // Store as ISO date string (YYYY-MM-DD)
    this.date = parsedDate.toISOString().split('T')[0];
  }

  // Normalize time format (HH:MM) if time is modified
  if (this.isModified('time')) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.time)) {
      throw new Error('Time must be in HH:MM format (e.g., 14:30)');
    }
  }
});

// Use existing model if it exists (prevents model overwrite during hot reload)
const Event = models.Event || model<Event>('Event', EventSchema);

export default Event;
