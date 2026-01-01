"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    // For /events/create, only match exactly or paths that start with /events/create
    if (href === "/events/create") {
      return (
        pathname === "/events/create" || pathname.startsWith("/events/create/")
      );
    }
    // For /events, match /events but not /events/create
    if (href === "/events") {
      return (
        pathname === "/events" ||
        (pathname.startsWith("/events/") &&
          !pathname.startsWith("/events/create"))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <header>
      <nav>
        <Link href="/" className="logo" aria-label="TechHub Events home">
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-mark-core" />
          </div>
          <div className="logo-wordmark">
            <span className="logo-text-primary">TechHub</span>
            <span className="logo-text-secondary">events</span>
          </div>
        </Link>

        <ul className="nav-links">
          <li>
            <Link
              href="/"
              className={`nav-link${isActive("/") ? " nav-link--active" : ""}`}
            >
              Discover
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className={`nav-link${
                isActive("/events") ? " nav-link--active" : ""
              }`}
            >
              Events
            </Link>
          </li>
          <li>
            <Link
              href="/events/create"
              className={`nav-link${
                isActive("/events/create") ? " nav-link--active" : ""
              }`}
            >
              Host an event
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
export default Navbar;
