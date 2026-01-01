import React from "react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { IEvent } from "@/database";
import EventCard from "@/components/EventCard";

const EventsPage = async () => {
  await connectDB();

  const events = (await Event.find().sort({ date: 1, time: 1 }).lean()) as unknown as IEvent[];

  return (
    <section id="event">
      <div className="header">
        <p className="section-label">All events</p>
        <h1>Discover upcoming events</h1>
        <p>
          Browse hackathons, meetups and conferences curated for developers, designers and founders.
        </p>
      </div>

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
        ) : null}
      </div>
    </section>
  );
};

export default EventsPage;
