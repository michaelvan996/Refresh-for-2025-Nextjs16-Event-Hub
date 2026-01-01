import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import NavbarWrapper from "@/components/NavbarWrapper";
import MobileBottomNavWrapper from "@/components/MobileBottomNavWrapper";
import React, { Suspense } from "react";
import PostHogAnalytics from "@/components/PostHogAnalytics";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian_mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TechHub Events - Discover & Share Tech Events",
    template: "%s | TechHub Events",
  },
  description:
    "Your central hub to discover, share and track hackathons, meetups and conferences with your tech community.",
  keywords: [
    "tech events",
    "hackathons",
    "meetups",
    "conferences",
    "developer events",
    "tech community",
  ],
  authors: [{ name: "TechHub Events" }],
  creator: "TechHub Events",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://techhub-events.vercel.app",
    siteName: "TechHub Events",
    title: "TechHub Events - Discover & Share Tech Events",
    description:
      "Your central hub to discover, share and track hackathons, meetups and conferences with your tech community.",
    images: [
      {
        url: "/images/event-full.png",
        width: 1200,
        height: 630,
        alt: "TechHub Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechHub Events - Discover & Share Tech Events",
    description:
      "Your central hub to discover, share and track hackathons, meetups and conferences with your tech community.",
    images: ["/images/event-full.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        <PostHogAnalytics />
        <Suspense fallback={<div className="h-16" />}>
          <NavbarWrapper />
        </Suspense>
        <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.02}
            noiseAmount={0.0}
            distortion={0.01}
            className="custom-rays"
          />
        </div>
        <main>{children}</main>
        <Suspense fallback={null}>
          <MobileBottomNavWrapper />
        </Suspense>
      </body>
    </html>
  );
}
