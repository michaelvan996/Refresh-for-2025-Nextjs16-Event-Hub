"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import MobileBottomNav with no SSR to avoid usePathname() issues during static generation
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), {
  ssr: false,
  loading: () => null, // No loading state needed for bottom nav
});

const MobileBottomNavWrapper = () => {
  return <MobileBottomNav />;
};

export default MobileBottomNavWrapper;

