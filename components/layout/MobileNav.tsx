"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Bot,
  Pill,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCareLoop } from "@/providers/AppProvider";

export function MobileNav() {
  const pathname = usePathname();
  const { tasks } = useCareLoop();

  const urgentCount = tasks.filter(
    (t) => t.status === "NEEDS_ATTENTION" || t.status === "WAITING_FOR_APPROVAL"
  ).length;

  const mobileItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare, badge: urgentCount > 0 ? urgentCount : undefined },
    { label: "Care Agent", href: "/agent", icon: Bot, isCenterpiece: true },
    { label: "Meds", href: "/medications", icon: Pill },
    { label: "Records", href: "/records", icon: FileText },
    { label: "Family", href: "/family", icon: Users },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
      aria-label="Mobile Navigation"
    >
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all relative",
              isActive
                ? item.isCenterpiece
                  ? "text-teal-900 font-bold"
                  : "text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {item.isCenterpiece ? (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-0.5 shadow-sm transition-transform",
                  isActive ? "bg-teal-900 text-white scale-110" : "bg-teal-700 text-white"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
            ) : (
              <div className="relative mb-0.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-slate-900" : "text-slate-500")} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
