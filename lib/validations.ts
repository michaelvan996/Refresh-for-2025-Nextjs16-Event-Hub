import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

/**
 * Event creation validation schema
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  overview: z
    .string()
    .min(20, "Overview must be at least 20 characters")
    .max(5000, "Overview must be less than 5000 characters"),
  venue: z
    .string()
    .min(2, "Venue must be at least 2 characters")
    .max(200, "Venue must be less than 200 characters"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be less than 200 characters"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  mode: z
    .string()
    .min(2, "Mode must be at least 2 characters")
    .max(50, "Mode must be less than 50 characters"),
  audience: z
    .string()
    .min(2, "Audience must be at least 2 characters")
    .max(200, "Audience must be less than 200 characters"),
  organizer: z
    .string()
    .min(2, "Organizer must be at least 2 characters")
    .max(200, "Organizer must be less than 200 characters"),
  agenda: z
    .array(z.string().min(1, "Agenda items cannot be empty"))
    .min(1, "At least one agenda item is required"),
  tags: z
    .array(z.string().min(1, "Tags cannot be empty"))
    .min(1, "At least one tag is required"),
});

/**
 * Booking validation schema
 */
export const bookingSchema = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid event ID format"),
  slug: z.string().min(1, "Slug is required"),
  email: emailSchema,
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
