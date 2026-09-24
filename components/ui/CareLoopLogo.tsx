import React from "react";

interface CareLoopLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  inverted?: boolean;
}

export function CareLoopLogo({
  className = "",
  size = "md",
  showText = true,
  subtitle = "Family Health Coordination",
  inverted = false,
}: CareLoopLogoProps) {
  const iconDimensions = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  }[size];

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Geometric Vector Mark */}
      <div
        className={`${iconDimensions} rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${
          inverted
            ? "bg-white text-slate-900 shadow-sm"
            : "bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xs ring-1 ring-white/10"
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          <defs>
            <linearGradient id="careloop-teal" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2dd4bf" />
              <stop offset="0.5" stopColor="#0d9488" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="careloop-rose" x1="16" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb7185" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          
          {/* Continuous interlocking care loop: family member + coordinator infinity embrace */}
          <path
            d="M10 8C6.68629 8 4 10.6863 4 14C4 18.2 8.5 22.2 16 26.5C23.5 22.2 28 18.2 28 14C28 10.6863 25.3137 8 22 8C19.2 8 17.2 9.5 16 11.2C14.8 9.5 12.8 8 10 8Z"
            stroke="url(#careloop-teal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Internal continuous coordination node */}
          <circle cx="16" cy="15" r="2.5" fill="#5eead4" />
          <path
            d="M11 14C11 12.5 12.5 11 14 11"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight font-display ${titleSizes} ${
              inverted ? "text-white" : "text-slate-900"
            }`}
          >
            CareLoop
          </span>
          {subtitle && (
            <span
              className={`text-[10px] tracking-normal font-medium mt-0.5 ${
                inverted ? "text-teal-200/80" : "text-slate-500"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
