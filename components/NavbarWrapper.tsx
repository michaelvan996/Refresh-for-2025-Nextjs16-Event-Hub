"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import Navbar with no SSR to avoid usePathname() issues during static generation
const Navbar = dynamic(() => import("@/components/Navbar"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

const NavbarWrapper = () => {
  return <Navbar />;
};

export default NavbarWrapper;
