import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {IEvent} from "@/database";

const Page = async () => {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean() as IEvent[];

    return (
        <section>
            <h1 className="text-center">Welcome to tech hub <br /> Event of a lifetime</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Feature Events</h3>

                <ul className="events">
                    { events && events.length > 0 && events.map((event: any) => (
                        <li key={event.slug} className="list-none">
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
