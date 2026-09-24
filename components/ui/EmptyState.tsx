import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustrationSrc?: string;
  illustrationAlt?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
  variant?: "calm" | "success" | "neutral";
}

export function EmptyState({
  icon: Icon = ShieldCheck,
  illustrationSrc,
  illustrationAlt,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className = "",
  variant = "calm",
}: EmptyStateProps) {
  const iconColors = {
    calm: "bg-teal-50 text-teal-700 border-teal-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  }[variant];

  return (
    <div
      className={`p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs ${className}`}
    >
      {illustrationSrc ? (
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-1 relative">
          <Image
            src={illustrationSrc}
            alt={illustrationAlt || title}
            width={96}
            height={96}
            className="w-full h-full object-contain mx-auto"
          />
        </div>
      ) : (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconColors} shadow-xs`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-slate-900 font-display">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel && (actionHref || onActionClick)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800 text-xs font-semibold">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onActionClick}
              className="bg-slate-900 hover:bg-slate-800 text-xs font-semibold"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
