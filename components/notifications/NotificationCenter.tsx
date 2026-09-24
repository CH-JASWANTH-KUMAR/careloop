"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Pill,
  Calendar,
  AlertTriangle,
  ClipboardList,
  X,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCareLoop } from "@/providers/AppProvider";
import type { CareNotification } from "@/types";

export type { CareNotification } from "@/types";

interface NotificationCenterProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function NotificationCenter({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: NotificationCenterProps = {}) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    readNotificationIds,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useCareLoop();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = controlledOnToggle || (() => setInternalIsOpen((prev) => !prev));
  const closeOpen = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside or Escape to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeOpen();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeOpen();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOpen]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    markAllNotificationsAsRead(allIds);
  };

  const handleNotificationClick = (item: CareNotification) => {
    markNotificationAsRead(item.id);
    closeOpen();
    router.push(item.href);
  };

  const getCategoryBadge = (category: CareNotification["category"]) => {
    switch (category) {
      case "SAFETY":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Safety</span>
          </span>
        );
      case "MEDICATION":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Pill className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Medication</span>
          </span>
        );
      case "APPOINTMENT":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
            <span>Appointment</span>
          </span>
        );
      case "CARE":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ClipboardList className="w-3 h-3 text-slate-600 shrink-0" />
            <span>Care</span>
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Unified h-9 Bell Trigger Button with Attached Unread Badge */}
      <button
        type="button"
        onClick={toggleOpen}
        className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs cursor-pointer"
        aria-label={`Family Care Notifications (${unreadCount} unread)`}
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-600 shrink-0" />
        <span className="min-w-4 h-4 px-1 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {unreadCount}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-white border border-slate-200 shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
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
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={closeOpen}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
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
                const isRead = readNotificationIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 text-left cursor-pointer transition-colors ${
                      isRead ? "bg-white hover:bg-slate-50" : "bg-emerald-50/20 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="mt-0.5">{getCategoryBadge(item.category)}</div>

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
