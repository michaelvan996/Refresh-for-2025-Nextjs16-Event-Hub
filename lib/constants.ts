export type EventItem = {
  image: string
  title: string
  slug: string
  location: string
  date: string
  time: string
}

// Curated list of real and popular tech events/hackathons.
// Image paths reference files under public/images.
export const events: EventItem[] = [
  {
    image: "/images/event1.png",
    title: "Google I/O 2026",
    slug: "google-io-2026",
    location: "Shoreline Amphitheatre, Mountain View, CA (and online)",
    date: "May 2026 (Dates TBA)",
    time: "TBA",
  },
  {
    image: "/images/event2.png",
    title: "Apple WWDC 2026",
    slug: "apple-wwdc-2026",
    location: "Apple Park, Cupertino, CA (and online)",
    date: "June 2026 (Dates TBA)",
    time: "TBA",
  },
  {
    image: "/images/event3.png",
    title: "Microsoft Build 2026",
    slug: "microsoft-build-2026",
    location: "Seattle, WA (and online)",
    date: "May 2026 (Dates TBA)",
    time: "TBA",
  },
  {
    image: "/images/event4.png",
    title: "DEF CON 34",
    slug: "def-con-34",
    location: "Las Vegas, NV",
    date: "August 6–9, 2026",
    time: "09:00 – 18:00 PT",
  },
  {
    image: "/images/event5.png",
    title: "HackMIT 2026",
    slug: "hackmit-2026",
    location: "MIT, Cambridge, MA",
    date: "September 2026 (Weekend TBA)",
    time: "TBA",
  },
  {
    image: "/images/event6.png",
    title: "KubeCon + CloudNativeCon North America 2026",
    slug: "kubecon-cloudnativecon-na-2026",
    location: "USA (City TBA) and online",
    date: "October 2026 (Dates TBA)",
    time: "TBA",
  },
]

export default events
