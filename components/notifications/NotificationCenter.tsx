"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Pill,
  Calendar,
  Truck,
  AlertTriangle,
  ClipboardList,
  Volume2,
  X,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCareLoop } from "@/providers/AppProvider";

export interface CareNotification {
  id: string;
  category: "MEDICATION" | "APPOINTMENT" | "DELIVERY" | "SYMPTOM" | "TASK" | "VOICE";
  title: string;
  description: string;
  timestamp: string;
  href: string;
  isUrgent?: boolean;
}

const READ_STORAGE_KEY = "careloop_read_notifications_v1";

export function NotificationCenter() {
  const router = useRouter();
  const { medications, tasks, appointments, activity } = useCareLoop();

  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(READ_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // safe fallback
      }
    }
    return [];
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const saveReadIds = (newIds: string[]) => {
    setReadIds(newIds);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(newIds));
    } catch {
      // safe fallback
    }
  };

  // Derive notifications from live store data
  const notifications: CareNotification[] = useMemo(() => {
    const list: CareNotification[] = [];

    // 1. Symptom / Escalated tasks
    const escalatedTasks = tasks.filter(
      (t) => t.status === "ESCALATED" || t.source === "VOICE_ESCALATION"
    );
    escalatedTasks.forEach((t) => {
      list.push({
        id: `notif-symptom-${t.id}`,
        category: "SYMPTOM",
        title: "Possible Symptom Reported",
        description: t.title,
        timestamp: "Just now",
        href: "/tasks",
        isUrgent: true,
      });
    });

    // 2. Medication shortages
    const lowStockMeds = medications.filter(
      (m) => m.remainingDays <= 5 && m.status === "ACTIVE"
    );
    lowStockMeds.forEach((m) => {
      list.push({
        id: `notif-med-${m.id}`,
        category: "MEDICATION",
        title: `${m.name} supply running low`,
        description: `Only ${m.remainingDays} days of medication remaining. Refill coordination needed.`,
        timestamp: "1h ago",
        href: "/medications",
        isUrgent: true,
      });
    });

    // 3. Pending approvals
    const approvalTasks = tasks.filter(
      (t) =>
        t.status === "WAITING_FOR_APPROVAL" ||
        (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
    );
    approvalTasks.forEach((t) => {
      list.push({
        id: `notif-task-${t.id}`,
        category: "TASK",
        title: "Care Action Needs Sign-Off",
        description: t.title,
        timestamp: "2h ago",
        href: "/tasks",
        isUrgent: true,
      });
    });

    // 4. Upcoming appointments
    const upcomingApts = appointments.filter((a) => a.status === "UPCOMING");
    upcomingApts.forEach((a) => {
      list.push({
        id: `notif-apt-${a.id}`,
        category: "APPOINTMENT",
        title: `Cardiology Consultation Tomorrow`,
        description: `With ${a.doctor} at ${a.hospital} (${a.time || "10:30 AM"}). Preparation packet ready.`,
        timestamp: "3h ago",
        href: "/appointments",
      });
    });

    // 5. In-flight logistics
    const inFlightTasks = tasks.filter(
      (t) => t.status === "IN_PROGRESS" || t.status === "WAITING"
    );
    if (inFlightTasks.length > 0) {
      list.push({
        id: "notif-delivery-active",
        category: "DELIVERY",
        title: "Pharmacy Delivery Dispatched",
        description: "Delhivery cold-chain courier in transit to Jubilee Hills (4.2°C logged).",
        timestamp: "4h ago",
        href: "/care",
      });
    }

    // 6. Recent voice check from activity
    const recentVoice = activity.find(
      (ev) =>
        ev.actionType === "VOICE_CALL_COMPLETED" ||
        ev.actionType === "VOICE_ESCALATION_TRIGGERED"
    );
    if (recentVoice) {
      list.push({
        id: `notif-voice-${recentVoice.id}`,
        category: "VOICE",
        title: "Gnani Voice Wellness Check Logged",
        description: recentVoice.description,
        timestamp: "5h ago",
        href: "/activity",
      });
    }

    return list;
  }, [medications, tasks, appointments, activity]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(allIds);
  };

  const handleNotificationClick = (item: CareNotification) => {
    if (!readIds.includes(item.id)) {
      saveReadIds([...readIds, item.id]);
    }
    setIsOpen(false);
    router.push(item.href);
  };

  const getCategoryIcon = (category: CareNotification["category"]) => {
    switch (category) {
      case "SYMPTOM":
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case "MEDICATION":
        return <Pill className="w-4 h-4 text-amber-600 shrink-0" />;
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-teal-600 shrink-0" />;
      case "DELIVERY":
        return <Truck className="w-4 h-4 text-indigo-600 shrink-0" />;
      case "VOICE":
        return <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "TASK":
      default:
        return <ClipboardList className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
        aria-label="Family Care Notifications"
        title="Care Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">Care Updates</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <p className="font-medium text-slate-700 mb-1">You&apos;re all caught up</p>
                <p>No active family notifications right now.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 text-left cursor-pointer transition-colors ${
                      isRead ? "bg-white hover:bg-slate-50" : "bg-emerald-50/20 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="mt-0.5">{getCategoryIcon(item.category)}</div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-semibold truncate ${
                            item.isUrgent ? "text-rose-900" : "text-slate-900"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>

                        {!isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {!isRead && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
