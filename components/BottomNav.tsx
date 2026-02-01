"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusCircle, Search, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/log-wine", icon: PlusCircle, label: "Log", isLog: true },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on landing page and login page
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200">
      <div className="flex w-full items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || (item.href === "/log-wine" && pathname?.startsWith("/log-wine"));
          const Icon = item.icon;

          if (item.isLog) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-1 min-w-[56px]"
                aria-label={item.label}
              >
                <Icon
                  className="h-7 w-7 text-purple-600 transition-colors"
                  strokeWidth={2.5}
                />
                <span className="text-[10px] font-medium text-purple-600">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 min-w-[56px]"
              aria-label={item.label}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  active ? "text-purple-600" : "text-neutral-400"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-purple-600" : "text-neutral-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
