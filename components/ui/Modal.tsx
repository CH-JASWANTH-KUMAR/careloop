"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerBadge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  closeOnBackdropClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  headerBadge,
  children,
  footer,
  maxWidth = "md",
  closeOnBackdropClick = true,
}: ModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Lock background body scroll and prevent layout shift
  useEffect(() => {
    if (isOpen && mounted) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen, mounted]);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mounted, onClose]);

  if (!isOpen || !mounted) return null;

  const widthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    "2xl": "max-w-3xl",
    "3xl": "max-w-4xl",
    full: "max-w-5xl",
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Full Viewport Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog Card Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-10 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] overflow-hidden transition-all duration-200 animate-in zoom-in-95 fade-in",
          widthStyles[maxWidth]
        )}
      >
        {/* Fixed Pinned Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="space-y-1 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {title}
              </h2>
              {headerBadge}
            </div>
            {description && (
              <p id="modal-description" className="text-xs text-slate-500 leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
          {children}
        </div>

        {/* Optional Pinned Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0 flex flex-wrap items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
