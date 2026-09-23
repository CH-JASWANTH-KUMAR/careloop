"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCareLoop } from "@/providers/AppProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { tasks, medications } = useCareLoop();

  // The store returns seed-stable data when !mounted, so this is hydration-safe.
  const urgentCount =
    tasks.filter((t) => t.status === "NEEDS_ATTENTION" || t.status === "WAITING_FOR_APPROVAL").length +
    medications.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE").length;

  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (href === "/care" && ["/tasks", "/medications", "/appointments", "/continuity"].includes(pathname)) {
      return true;
    }
    if (href === "/family" && pathname.startsWith("/family/")) {
      return true;
    }
    return false;
  };

  const mobileItems = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Family", href: "/family", icon: Users },
    { label: "Care", href: "/care", icon: HeartHandshake, badge: urgentCount > 0 ? urgentCount : undefined },
    { label: "Activity", href: "/activity", icon: History },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg select-none"
      aria-label="Mobile Navigation"
    >
      {mobileItems.map((item) => {
        const isActive = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
              isActive ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
            )}
          >
            <div className="relative mb-0.5">
              <Icon className={cn("w-5 h-5", isActive ? "text-slate-900" : "text-slate-400")} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1.5 min-w-[14px] h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
