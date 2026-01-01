import React from 'react'
import Link from "next/link";
import Image from "next/image";

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}


const EventCard = ({title, image, slug, location, date, time}: Props) => {
    return (
        <Link href={`/events/${slug}`} id="event-card" className="touch-manipulation">
            <Image 
                src={image} 
                alt={title} 
                width={410} 
                height={300} 
                className="poster"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            <div className="flex flex-row gap-1.5 sm:gap-2 items-center">
                <Image 
                    src="/icons/pin.svg" 
                    alt="location" 
                    width={14} 
                    height={14} 
                    className="flex-shrink-0"
                    style={{ width: "auto", height: "auto" }}
                />
                <p className="truncate">{location}</p>
            </div>

            <p className="title">{title}</p>

            <div className="datetime">
                <div>
                    <Image 
                        src="/icons/calendar.svg" 
                        alt="date" 
                        width={14} 
                        height={14}
                        className="flex-shrink-0"
                        style={{ width: "auto", height: "auto" }}
                    />
                    <p className="truncate">{date}</p>
                </div>
                <div>
                    <Image 
                        src="/icons/clock.svg" 
                        alt="time" 
                        width={14} 
                        height={14}
                        className="flex-shrink-0"
                        style={{ width: "auto", height: "auto" }}
                    />
                    <p className="truncate">{time}</p>
                </div>
            </div>
        </Link>
    )
}
export default EventCard
