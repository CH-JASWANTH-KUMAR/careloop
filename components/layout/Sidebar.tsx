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
  Bot,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCareLoop } from "@/providers/AppProvider";
import { CareLoopLogo } from "@/components/ui/CareLoopLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "urgent" | "warning" | "neutral" | "info";
}

export function Sidebar() {
  const pathname = usePathname();
  const { tasks, medications, activeUser, members, switchActiveUser, family } = useCareLoop();

  const urgentTasksCount = tasks.filter(
    (t) => t.status === "NEEDS_ATTENTION" || t.status === "WAITING_FOR_APPROVAL"
  ).length;

  const urgentMedsCount = medications.filter(
    (m) => m.remainingDays <= 5 && m.status === "ACTIVE"
  ).length;

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
      label: "Care Agent",
      href: "/agent",
      icon: Bot,
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

  const isCoordinator = activeUser.id === family?.primaryCoordinatorId;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white sticky top-0 h-screen shrink-0 z-20 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg p-0.5"
        >
          <CareLoopLogo size="md" />
        </Link>
      </div>

      {/* Active User Persona Context */}
      <div className="p-3 mx-3 mt-3 bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/80 rounded-xl shrink-0 shadow-2xs">
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">
          <span>Active Perspective</span>
          <span className="text-teal-700 font-mono">
            {isCoordinator ? "Primary Coordinator" : activeUser.role.replace(/_/g, " ")}
          </span>
        </div>

        <div className="relative">
          <select
            value={activeUser.id}
            onChange={(e) => switchActiveUser(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg py-2 pl-2.5 pr-7 text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none shadow-2xs"
            aria-label="Switch family member perspective"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1.5 px-0.5 truncate">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{activeUser.location}</span>
        </div>
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
                      isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-900"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                      isActive
                        ? "bg-rose-500 text-white"
                        : "bg-rose-100 text-rose-800"
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
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
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
        <p className="text-[10px] text-slate-400 font-medium">CareLoop · The Rao Family</p>
      </div>
    </aside>
  );
}
