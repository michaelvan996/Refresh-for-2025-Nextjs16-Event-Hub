import React, { Suspense } from "react";
import { headers } from "next/headers";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { IEvent } from "@/database";

async function FeaturedEvents() {
  // Establish request context before any database operations
  // This satisfies Next.js 16 requirement for accessing time-based operations
  await headers();

  try {
    await connectDB();

    console.log("Fetching events from database...");
    const events = (await Event.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
      .exec()) as unknown as IEvent[];

    console.log(`Found ${events.length} events`);

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3>Featured events</h3>
            <p className="mt-1 text-sm text-light-200">
              Curated meetups, hackathons and conferences for modern tech teams.
            </p>
          </div>
        </div>

        {events && events.length > 0 ? (
          <ul className="events">
            {events.map((event: any) => (
              <li key={event.slug} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-4 py-8 text-center">
            <p className="text-light-200">
              No events found. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Log detailed error for debugging in Vercel logs
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to load events:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + "...",
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3>Featured events</h3>
            <p className="mt-1 text-sm text-light-200">
              Curated meetups, hackathons and conferences for modern tech teams.
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

const Page = () => {
  return (
    <section id="home" className="relative pb-12 sm:pb-16 lg:pb-20 pt-8 sm:pt-12 lg:pt-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:gap-6 text-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-dark/60 bg-dark-100/60 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-light-200">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>The hub for every tech event</span>
        </div>

        <h1 className="px-2">
          Discover &amp; share
          <br />
          <span className="text-primary">live tech events</span>
        </h1>

        <p className="subheading max-w-2xl">
          Your central hub to discover, share and track hackathons, meetups and
          conferences with your tech community.
        </p>

        <div className="mt-6 sm:mt-7 flex items-center justify-center w-full sm:w-auto">
          <ExploreBtn />
        </div>

        <div className="mt-6 sm:mt-8 grid w-full gap-3 sm:gap-4 text-left text-xs sm:text-sm text-light-200 sm:grid-cols-3">
          <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="font-martian-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-light-200">
              For the community
            </p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
              Built for tech communities &amp; hubs.
            </p>
          </div>
          <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="font-martian-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-light-200">
              This week
            </p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
              Discover what&apos;s happening around you.
            </p>
          </div>
          <div className="rounded-xl border border-border-dark/60 bg-dark-100/70 px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="font-martian-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-light-200">
              For organizers
            </p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
              Share events with the right audience.
            </p>
          </div>
        </div>
      </div>

      <div id="events" className="mt-12 sm:mt-14 lg:mt-16">
        <Suspense fallback={<div>Loading events...</div>}>
          <FeaturedEvents />
        </Suspense>
      </div>
    </section>
  );
};
export default Page;
