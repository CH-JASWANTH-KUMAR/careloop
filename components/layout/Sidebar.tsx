"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Pill,
  Calendar,
  Bot,
  History,
  Settings,
  ShieldCheck,
  PhoneCall,
  CreditCard,
  Truck,
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
  isCenterpiece?: boolean;
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

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Family",
      href: "/family",
      icon: Users,
    },
    {
      label: "Care Continuity",
      href: "/continuity",
      icon: ShieldCheck,
      badge: "Protocol",
      badgeVariant: "neutral",
    },
    {
      label: "Health Records",
      href: "/records",
      icon: FileText,
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      badge: urgentTasksCount > 0 ? urgentTasksCount : undefined,
      badgeVariant: "urgent",
    },
    {
      label: "Medications",
      href: "/medications",
      icon: Pill,
      badge: urgentMedsCount > 0 ? urgentMedsCount : undefined,
      badgeVariant: "warning",
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: Calendar,
    },
    {
      label: "Care Agent",
      href: "/agent",
      icon: Bot,
      isCenterpiece: true,
      badge: "AI Action",
      badgeVariant: "info",
    },
    {
      label: "Onboarding",
      href: "/onboarding",
      icon: Users,
    },
    {
      label: "Activity",
      href: "/activity",
      icon: History,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <HeartHandshake className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">CareLoop</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                Round 2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Family Health Coordination</p>
          </div>
        </Link>
      </div>

      {/* Active User Persona Context */}
      <div className="p-3 mx-3 mt-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
          <span>Active Coordinator</span>
          <span className="text-teal-700 font-semibold">{activeUser.role.replace(/_/g, " ")}</span>
        </div>
        <select
          value={activeUser.id}
          onChange={(e) => switchActiveUser(e.target.value)}
          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
          aria-label="Switch family member context"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.relationship})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          Managing for Anita & Ramesh Rao (Hyd)
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? item.isCenterpiece
                    ? "bg-teal-900 text-white shadow-xs"
                    : "bg-slate-900 text-white shadow-xs"
                  : item.isCenterpiece
                  ? "text-teal-800 bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-white"
                      : item.isCenterpiece
                      ? "text-teal-700"
                      : "text-slate-500 group-hover:text-slate-900"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded text-[10px] font-mono",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeVariant === "urgent"
                      ? "bg-red-100 text-red-700 font-semibold"
                      : item.badgeVariant === "warning"
                      ? "bg-amber-100 text-amber-800 font-semibold"
                      : "bg-teal-100 text-teal-800"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Three-Rail Subsystem Status */}
      <div className="p-3 m-3 border border-slate-200 bg-slate-50/60 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Integrated Rails
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-sky-600" /> Gnani Voice
            </span>
            <span className="text-[10px] font-mono text-emerald-600">Ready</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-amber-600" /> Pine Labs Auth
            </span>
            <span className="text-[10px] font-mono text-emerald-600">Active</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-indigo-600" /> Delhivery Express
            </span>
            <span className="text-[10px] font-mono text-emerald-600">Tracked</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
