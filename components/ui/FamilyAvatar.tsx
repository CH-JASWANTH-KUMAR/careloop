"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FamilyAvatarProps {
  member?: {
    id?: string;
    name: string;
    relationship?: string;
    avatarColor?: string;
    role?: string;
  };
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatusDot?: boolean;
  statusVariant?: "healthy" | "warning" | "urgent" | "info" | "neutral" | "waiting";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-14 h-14 text-lg",
};

const dotSizeClasses = {
  xs: "w-1.5 h-1.5 bottom-0 right-0",
  sm: "w-2 h-2 bottom-0 right-0",
  md: "w-2.5 h-2.5 bottom-0.5 right-0.5",
  lg: "w-3 h-3 bottom-0.5 right-0.5",
  xl: "w-3.5 h-3.5 bottom-1 right-1",
};

const statusColors = {
  healthy: "bg-emerald-500 ring-white",
  warning: "bg-amber-500 ring-white",
  waiting: "bg-amber-500 ring-white",
  urgent: "bg-rose-500 ring-white",
  info: "bg-teal-500 ring-white",
  neutral: "bg-slate-400 ring-white",
};

const defaultMemberColors: Record<string, { bg: string; text: string }> = {
  "mem-anita": { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800" },
  "mem-ramesh": { bg: "bg-blue-100 border-blue-300", text: "text-blue-800" },
  "mem-arjun": { bg: "bg-indigo-100 border-indigo-300", text: "text-indigo-800" },
  "mem-meera": { bg: "bg-purple-100 border-purple-300", text: "text-purple-800" },
};

export function FamilyAvatar({
  member,
  name,
  size = "md",
  showStatusDot = false,
  statusVariant = "healthy",
  className = "",
}: FamilyAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const memberName = member?.name || name || "Family Member";
  const memberId =
    member?.id ||
    (memberName.toLowerCase().includes("anita")
      ? "mem-anita"
      : memberName.toLowerCase().includes("ramesh")
      ? "mem-ramesh"
      : memberName.toLowerCase().includes("meera")
      ? "mem-meera"
      : "mem-arjun");

  const firstName = memberName.split(" ")[0].toLowerCase();
  const imagePath = `/images/family/${firstName}.svg`;

  const initials = memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colorScheme =
    defaultMemberColors[memberId] || {
      bg: "bg-slate-100 border-slate-300",
      text: "text-slate-800",
    };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {!imageError ? (
        <div
          className={`relative rounded-full overflow-hidden border border-slate-200 shadow-xs ${sizeClasses[size]}`}
        >
          <Image
            src={imagePath}
            alt={memberName}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div
          className={`rounded-full border font-semibold flex items-center justify-center select-none shadow-xs ${colorScheme.bg} ${colorScheme.text} ${sizeClasses[size]}`}
          title={`${memberName} (${member?.relationship || "Family Member"})`}
        >
          {initials}
        </div>
      )}

      {showStatusDot && (
        <span
          className={`absolute rounded-full ring-2 ${dotSizeClasses[size]} ${statusColors[statusVariant]}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
