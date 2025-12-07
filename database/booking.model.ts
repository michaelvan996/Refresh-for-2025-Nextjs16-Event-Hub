import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // Email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index on eventId for faster lookup queries
BookingSchema.index({ eventId: 1 });

// Create index on email for user booking lookups
BookingSchema.index({email: 1});

/**
 * Pre-save hook to validate that the referenced event exists
 * Throws error if event doesn't exist in database
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's modified or new
  if (this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency
      const Event = models.Event || (await import('./event.model')).default;
      
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        return next(new Error('Referenced event does not exist'));
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Referenced event does not exist') {
        return next(error);
      }
      return next(new Error('Error validating event reference'));
    }
  }

  next();
});

// Use existing model if it exists (prevents model overwrite during hot reload)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
