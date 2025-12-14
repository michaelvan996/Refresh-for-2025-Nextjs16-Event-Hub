import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    const response = await fetch(`${BASE_URL}/api/events`);
    const { events } = await response.json();

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
                            <EventCard title={""} image={""} slug={""} location={""} date={""} time={""} {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
