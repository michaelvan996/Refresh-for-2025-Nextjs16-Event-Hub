import React, { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { IEvent } from "@/database";
import EventCard from "@/components/EventCard";

async function EventsContent() {
  try {
    await connectDB();
    
    console.log('Fetching all events from database...');
    const events = (await Event.find()
      .sort({ date: 1, time: 1 })
      .lean()
      .exec()) as unknown as IEvent[];
    
    console.log(`Found ${events.length} events`);

    return (
      <div className="section-shell flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2>Events</h2>
            <p className="text-sm text-light-200">
              {events.length > 0
                ? `Showing ${events.length} event${events.length > 1 ? "s" : ""}.`
                : "No events yet. Be the first to host one."}
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <ul className="events">
            {events.map((event: any) => (
              <li key={event.slug} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-4 py-8 text-center">
            <p className="text-light-200">No events found. Be the first to create one!</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Failed to load events:", error);
    return (
      <div className="section-shell flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2>Events</h2>
            <p className="text-sm text-light-200">
              Unable to load events at this time.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-4 py-8 text-center">
          <p className="text-light-200">
            Unable to load events at this time. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

const EventsPage = async () => {
  return (
    <section id="event">
      <div className="header">
        <p className="section-label">All events</p>
        <h1>Discover upcoming events</h1>
        <p>
          Browse hackathons, meetups and conferences curated for developers,
          designers and founders.
        </p>
      </div>

      <Suspense
        fallback={<div className="section-shell">Loading events...</div>}
      >
        <EventsContent />
      </Suspense>
    </section>
  );
};

export default EventsPage;
