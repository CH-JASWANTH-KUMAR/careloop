import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "urgent"
  | "warning"
  | "success"
  | "info"
  | "neutral"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
}

export function Badge({
  children,
  className,
  variant = "neutral",
  showDot = false,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
    urgent: {
      bg: "bg-red-50",
      text: "text-red-700 font-medium",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-800 font-medium",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    success: {
      bg: "bg-emerald-50",
      text: "text-emerald-700 font-medium",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    info: {
      bg: "bg-sky-50",
      text: "text-sky-700 font-medium",
      border: "border-sky-200",
      dot: "bg-sky-500",
    },
    neutral: {
      bg: "bg-slate-100",
      text: "text-slate-700 font-medium",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-slate-600",
      border: "border-slate-300",
      dot: "bg-slate-400",
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs border tracking-tight transition-colors",
        style.bg,
        style.text,
        style.border,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", style.dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
