"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Discover",
    icon: "🔍",
    activeIcon: "🏠",
  },
  {
    href: "/events",
    label: "Events",
    icon: "📅",
    activeIcon: "📆",
  },
  {
    href: "/events/create",
    label: "Create",
    icon: "➕",
    activeIcon: "✨",
  },
];

const MobileBottomNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/events/create") {
      return (
        pathname === "/events/create" || pathname.startsWith("/events/create/")
      );
    }
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
    <nav
      className="mobile-bottom-nav"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item ${
                active ? "mobile-bottom-nav-item--active" : ""
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-bottom-nav-icon">
                {active ? item.activeIcon : item.icon}
              </span>
              <span className="mobile-bottom-nav-label">{item.label}</span>
              {active && <span className="mobile-bottom-nav-indicator" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

