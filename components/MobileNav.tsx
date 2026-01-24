"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Plus, List, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/map", icon: MapPin, label: "Map" },
  { href: "/log-wine", icon: Plus, label: "Add", isAdd: true },
  { href: "/lists", icon: List, label: "Lists" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-end justify-center gap-1 bg-white border-t border-neutral-200 safe-area-pb"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="flex w-full max-w-lg mx-auto items-end justify-around px-2 pt-3">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || (item.href === "/log-wine" && pathname?.startsWith("/log-wine"));
          const Icon = item.icon;

          if (item.isAdd) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6"
                aria-label={item.label}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition active:scale-95">
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <span className="mt-1 text-[10px] font-medium text-neutral-500">
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
