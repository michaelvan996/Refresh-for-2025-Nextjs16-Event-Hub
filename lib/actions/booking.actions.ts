'use server';

import Booking from "@/database/booking.model";

import connectDB from "@/lib/mongodb";

import { Types } from "mongoose";

export const createBooking = async ({eventId, slug, email}: {eventId: string; slug: string; email: string}) => {
    try {
        await connectDB();

        if (!eventId || !Types.ObjectId.isValid(eventId)) {
            return { success: false, error: `Invalid event ID: ${eventId}` };
        }

        const booking = await Booking.create({
            eventId: new Types.ObjectId(eventId),
            email
        });

        return { success: true, booking: JSON.parse(JSON.stringify(booking)) }
    } catch(e) {
        console.error('create booking failed', e);
        return {success: false, error: e};
    }
}