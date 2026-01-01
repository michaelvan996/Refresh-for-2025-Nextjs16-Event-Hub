"use server";

import { redirect } from "next/navigation";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch {
    return [];
  }
};

export async function createEventAction(formData: FormData) {
  try {
    await connectDB();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const overview = String(formData.get("overview") || "").trim();
    const image = String(formData.get("image") || "").trim();
    const venue = String(formData.get("venue") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const time = String(formData.get("time") || "").trim();
    const mode = String(formData.get("mode") || "").trim();
    const audience = String(formData.get("audience") || "").trim();
    const organizer = String(formData.get("organizer") || "").trim();

    const rawTags = String(formData.get("tags") || "");
    const rawAgenda = String(formData.get("agenda") || "");

    const tags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const agenda = rawAgenda
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    // Validate required fields
    if (
      !title ||
      !description ||
      !overview ||
      !image ||
      !venue ||
      !location ||
      !date ||
      !time ||
      !mode ||
      !audience ||
      !organizer
    ) {
      throw new Error("All fields are required");
    }

    if (tags.length === 0) {
      throw new Error("At least one tag is required");
    }

    if (agenda.length === 0) {
      throw new Error("At least one agenda item is required");
    }

    const event = new Event({
      title,
      description,
      overview,
      image,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      agenda,
      organizer,
      tags,
    });

    await event.save();

    redirect(`/events/${event.slug}`);
  } catch (error) {
    console.error("Failed to create event:", error);
    // Re-throw to let Next.js handle it with error boundaries
    throw error;
  }
}
