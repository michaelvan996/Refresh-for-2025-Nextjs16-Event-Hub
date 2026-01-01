import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { cacheLife } from "next/cache";

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image
      src={icon}
      alt={alt}
      width={17}
      height={17}
      style={{ height: "auto" }}
    />
    <p>{label}</p>
  </div>
);

/**
 * Parse array data that might be stored as a string representation
 * Converts: "[\"Cloud\", \"DevOps\"]" -> ["Cloud", "DevOps"]
 */
function parseStringArray(data: unknown): string[] {
  // If already an array, return it
  if (Array.isArray(data)) {
    return data
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  // If it's a string, try to parse it
  if (typeof data === "string") {
    const trimmed = data.trim();

    if (trimmed.length === 0) {
      return [];
    }

    // Try JSON.parse for string arrays like '["Cloud", "DevOps"]'
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).trim())
            .filter((item) => item.length > 0);
        }
      } catch {
        // If JSON.parse fails, use regex to extract all quoted strings
        // This regex matches: "anything" or 'anything' including escaped quotes
        const items: string[] = [];

        // More robust regex: matches quoted strings with escaped quotes
        const regex = /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g;
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(trimmed)) !== null) {
          const content = match[2];
          // Unescape escaped quotes and backslashes
          const unescaped = content
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\")
            .trim();
          if (unescaped.length > 0) {
            items.push(unescaped);
          }
          lastIndex = regex.lastIndex;
        }

        // If regex found items, return them
        if (items.length > 0) {
          return items;
        }

        // Fallback: try simple extraction from inner content
        const inner = trimmed.slice(1, -1).trim();
        if (inner.length > 0) {
          // Try splitting by comma and cleaning up
          const parts = inner
            .split(",")
            .map((p) => {
              return p
                .trim()
                .replace(/^["']+|["']+$/g, "") // Remove surrounding quotes
                .replace(/\\"/g, '"') // Unescape quotes
                .replace(/\\'/g, "'")
                .trim();
            })
            .filter((p) => p.length > 0);

          if (parts.length > 0) {
            return parts;
          }
        }
      }
    }

    // Try comma-separated string
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter((item) => item.length > 0);
    }

    // Single item
    return [trimmed.replace(/^["']|["']$/g, "")];
  }

  return [];
}

const EventAgenda = ({
  agendaItems,
}: {
  agendaItems: string[] | string | unknown;
}) => {
  // Ensure we parse the agenda properly
  let items: string[] = [];

  if (Array.isArray(agendaItems)) {
    items = agendaItems
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  } else {
    items = parseStringArray(agendaItems);
  }

  // Final safety check - if we still have a string that looks like an array, parse it
  if (
    items.length === 1 &&
    typeof items[0] === "string" &&
    items[0].startsWith("[")
  ) {
    items = parseStringArray(items[0]);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="section-shell agenda">
      <p className="section-label">Agenda</p>
      <h2>Agenda</h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, index) => {
          const cleanItem = String(item).trim();
          if (!cleanItem) return null;
          return (
            <li key={index} className="flex items-start gap-3 text-light-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="flex-1">{cleanItem}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const EventTags = ({ tags }: { tags: string[] | string | unknown }) => {
  // Ensure we parse the tags properly
  let tagArray: string[] = [];

  if (Array.isArray(tags)) {
    tagArray = tags.map((t) => String(t).trim()).filter((t) => t.length > 0);
  } else {
    tagArray = parseStringArray(tags);
  }

  // Final safety check - if we still have a string that looks like an array, parse it
  if (
    tagArray.length === 1 &&
    typeof tagArray[0] === "string" &&
    tagArray[0].startsWith("[")
  ) {
    tagArray = parseStringArray(tagArray[0]);
  }

  if (tagArray.length === 0) {
    return null;
  }

  return (
    <section className="section-shell">
      <p className="section-label">Topics</p>
      <div className="flex flex-row gap-2 flex-wrap">
        {tagArray.map((tag, index) => {
          const cleanTag = String(tag).trim();
          if (!cleanTag) return null;
          return (
            <div className="pill" key={`tag-${index}-${cleanTag}`}>
              {cleanTag}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <EventDetailsContent params={params} />
    </React.Suspense>
  );
};

const EventDetailsContent = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  "use cache";
  cacheLife("hours");
  const { slug } = await params;

  await connectDB();
  const event = (await Event.findOne({ slug }).lean()) as IEvent | null;

  if (!event) return notFound();

  const {
    title,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda: rawAgenda,
    audience,
    tags: rawTags,
    organizer,
  } = event as IEvent & { title?: string };

  if (!description) return notFound();

  // Parse and normalize tags and agenda to ensure they're arrays
  // This handles cases where data might be stored as string representations like "[\"Cloud\", \"DevOps\"]"
  let agenda = parseStringArray(rawAgenda);
  let tags = parseStringArray(rawTags);

  // Recursive parsing: keep parsing until we get a proper array
  let agendaAttempts = 0;
  while (
    agenda.length === 1 &&
    typeof agenda[0] === "string" &&
    agenda[0].trim().startsWith("[") &&
    agendaAttempts < 3
  ) {
    agenda = parseStringArray(agenda[0]);
    agendaAttempts++;
  }

  let tagsAttempts = 0;
  while (
    tags.length === 1 &&
    typeof tags[0] === "string" &&
    tags[0].trim().startsWith("[") &&
    tagsAttempts < 3
  ) {
    tags = parseStringArray(tags[0]);
    tagsAttempts++;
  }

  // Final validation: ensure we have valid arrays
  if (!Array.isArray(agenda) || agenda.length === 0) {
    agenda = [];
  }
  if (!Array.isArray(tags) || tags.length === 0) {
    tags = [];
  }

  const bookings = 10;

  const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <p className="section-label">Event</p>
        <h1>{title ?? "Tech event"}</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side - Event Content */}
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="section-shell flex-col-gap-2">
            <p className="section-label">Overview</p>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="section-shell flex-col-gap-2">
            <p className="section-label">Event details</p>
            <div className="flex flex-col gap-3">
              <EventDetailItem
                icon="/icons/calendar.svg"
                alt="calendar"
                label={date}
              />
              <EventDetailItem
                icon="/icons/calendar.svg"
                alt="calendar"
                label={time}
              />
              <EventDetailItem
                icon="/icons/pin.svg"
                alt="pin"
                label={location}
              />
              <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
              <EventDetailItem
                icon="/icons/audience.svg"
                alt="audience"
                label={audience}
              />
            </div>
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="section-shell flex-col-gap-2">
            <p className="section-label">Organizer</p>
            <h2>About the organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side - Booking Form */}

        <aside className="booking">
          <div className="signup-card">
            <p className="section-label">Booking</p>
            <h2>Book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm text-light-200">
                Join {bookings} others already attending.
              </p>
            ) : (
              <p className="text-sm text-light-200">
                Be the first to book your spot.
              </p>
            )}

            <BookEvent eventId={event._id.toString()} slug={event.slug} />
          </div>
        </aside>
      </div>

      <div className="pt-16 w-full">
        <section className="section-shell flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="section-label">Discover more</p>
              <h2>Similar events</h2>
            </div>
          </div>

          <div className="events">
            {similarEvents.length > 0 &&
              similarEvents.map((similarEvent: any) => (
                <EventCard
                  key={similarEvent.slug ?? similarEvent._id?.toString()}
                  {...similarEvent}
                />
              ))}
          </div>
        </section>
      </div>
    </section>
  );
};
export default EventDetailsPage;
