import React from 'react'
import Image from "next/image";
import {notFound} from "next/navigation";
import BookEvent from "@/components/BookEvent";
import {IEvent} from "@/database";
import {getSimilarEventsBySlug} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {cacheLife} from "next/cache";

const EventDetailItem = ({icon, alt, label}: {icon: string, alt: string, label: string}) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({agendaItems}: {agendaItems: string[] } ) => (
    <section className="section-shell agenda">
        <p className="section-label">Agenda</p>
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </section>
)

const EventTags = ({tags}: {tags: string[]}) => (
    <section className="section-shell">
        <p className="section-label">Topics</p>
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    </section>
)

const EventDetailsPage = ({params}: {params: Promise<{ slug: string }>}) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <EventDetailsContent params={params} />
        </React.Suspense>
    )
}

const EventDetailsContent = async ({params}: {params: Promise<{ slug: string }>}) => {
    'use cache'
    cacheLife('hours')
    const { slug } = await params;
    
    await connectDB();
    const event = await Event.findOne({ slug }).lean() as IEvent | null;

    if (!event) return notFound();
    
    const {title, description, image, overview, date, time, location, mode, agenda, audience, tags, organizer} = event as IEvent & { title?: string };

    if(!description) return notFound();

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
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="section-shell flex-col-gap-2">
                        <p className="section-label">Overview</p>
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="section-shell flex-col-gap-2">
                        <p className="section-label">Event details</p>
                        <div className="flex flex-col gap-3">
                            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={time} />
                            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                        </div>
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="section-shell flex-col-gap-2">
                        <p className="section-label">Organizer</p>
                        <h2>About the organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags as string[]} />
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
                        ): (
                            <p className="text-sm text-light-200">Be the first to book your spot.</p>
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
                        {similarEvents.length > 0 && similarEvents.map((similarEvent: any) => (
                            <EventCard key={similarEvent.slug ?? similarEvent._id?.toString()} {...similarEvent} />
                        ))}
                    </div>
                </section>
            </div>
        </section>
    )
}
export default EventDetailsPage
