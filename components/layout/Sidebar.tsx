"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCareLoop } from "@/providers/AppProvider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "urgent" | "warning" | "neutral" | "info";
}

export function Sidebar() {
  const pathname = usePathname();
  const { tasks, medications, activeUser, members, switchActiveUser } = useCareLoop();

  const urgentTasksCount = tasks.filter(
    (t) => t.status === "NEEDS_ATTENTION" || t.status === "WAITING_FOR_APPROVAL"
  ).length;

  const urgentMedsCount = medications.filter(
    (m) => m.remainingDays <= 5 && m.status === "ACTIVE"
  ).length;

  // The store's useSyncExternalStore-based `mounted` flag already ensures
  // medications and tasks return seed defaults on SSR/first paint, so this
  // derived value is always hydration-safe without a per-component guard.
  const totalNeedsAttention = urgentTasksCount + urgentMedsCount;

  const primaryNavItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Family",
      href: "/family",
      icon: Users,
    },
    {
      label: "Care",
      href: "/care",
      icon: HeartHandshake,
      badge: totalNeedsAttention > 0 ? totalNeedsAttention : undefined,
      badgeVariant: "urgent",
    },
    {
      label: "Activity",
      href: "/activity",
      icon: History,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

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

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white sticky top-0 h-screen shrink-0 z-20 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg p-0.5"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base block leading-tight">
              CareLoop
            </span>
            <p className="text-[11px] text-slate-500 font-medium">Family Health Coordination</p>
          </div>
        </Link>
      </div>

      {/* Active User Persona Context */}
      <div className="p-3 mx-3 mt-3 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Active Coordinator</span>
          <span className="text-teal-700 font-semibold">{activeUser.role.replace(/_/g, " ")}</span>
        </div>
        <select
          value={activeUser.id}
          onChange={(e) => switchActiveUser(e.target.value)}
          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
          aria-label="Switch family member context"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.relationship})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          Managing for Anita &amp; Ramesh Rao (Hyd)
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        <div className="space-y-1">
          {primaryNavItems.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
          <div className="px-3 pb-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Preferences
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Subtle Support Note */}
      <div className="p-3 m-3 text-center border-t border-slate-100 shrink-0">
        <p className="text-[10px] text-slate-400">CareLoop Family Circle</p>
      </div>
    </aside>
  );
}
