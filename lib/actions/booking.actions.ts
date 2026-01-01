"use server";

import Booking from "@/database/booking.model";
import connectDB from "@/lib/mongodb";
import { bookingSchema } from "@/lib/validations";
import { Types } from "mongoose";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    await connectDB();

    // Validate input
    const validationResult = bookingSchema.safeParse({ eventId, slug, email });
    if (!validationResult.success) {
      return {
        success: false,
        error:
          validationResult.error.errors[0]?.message || "Invalid booking data",
      };
    }

    // Check for duplicate booking
    const existingBooking = await Booking.findOne({
      eventId: new Types.ObjectId(eventId),
      email: email.toLowerCase().trim(),
    }).lean();

    if (existingBooking) {
      return {
        success: false,
        error: "You have already booked this event",
      };
    }

    // Create booking
    const booking = await Booking.create({
      eventId: new Types.ObjectId(eventId),
      email: email.toLowerCase().trim(),
    });

    return {
      success: true,
      booking: JSON.parse(JSON.stringify(booking)),
    };
  } catch (e) {
    console.error("create booking failed", e);

    // Handle MongoDB duplicate key error
    if (e && typeof e === "object" && "code" in e && e.code === 11000) {
      return {
        success: false,
        error: "You have already booked this event",
      };
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to create booking",
    };
  }
};
