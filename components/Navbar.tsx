"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header>
      <nav>
        <Link 
          href="/" 
          className="logo" 
          aria-label="TechHub Events home"
          onClick={closeMobileMenu}
        >
          <div className="logo-mark" aria-hidden="true">
            <span className="logo-mark-core" />
          </div>
          <div className="logo-wordmark">
            <span className="logo-text-primary">TechHub</span>
            <span className="logo-text-secondary">events</span>
          </div>
        </Link>

        {/* Desktop Navigation - Only visible on desktop (md and above) */}
        <ul className="nav-links nav-links-desktop">
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

        {/* Mobile Menu Button - Hidden on mobile, bottom nav is used instead */}
        <button
          className="mobile-menu-button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={toggleMobileMenu}
          type="button"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? "hamburger-line--open" : ""}`} />
          <span className={`hamburger-line ${isMobileMenuOpen ? "hamburger-line--open" : ""}`} />
          <span className={`hamburger-line ${isMobileMenuOpen ? "hamburger-line--open" : ""}`} />
        </button>

        {/* Mobile Navigation Overlay - Hidden on mobile, bottom nav is used instead */}
        {isMounted && (
          <>
            <div
              className={`mobile-menu-overlay ${isMobileMenuOpen ? "mobile-menu-overlay--open" : ""}`}
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <ul className={`nav-links nav-links-mobile ${isMobileMenuOpen ? "nav-links-mobile--open" : ""}`}>
              <li>
                <Link
                  href="/"
                  className={`nav-link nav-link-mobile${isActive("/") ? " nav-link--active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  Discover
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className={`nav-link nav-link-mobile${
                    isActive("/events") ? " nav-link--active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events/create"
                  className={`nav-link nav-link-mobile${
                    isActive("/events/create") ? " nav-link--active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  Host an event
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>
    </header>
  );
};
export default Navbar;
