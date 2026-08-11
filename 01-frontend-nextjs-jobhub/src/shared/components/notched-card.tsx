import type { ReactNode } from "react";
import { ChevronIcon } from "./icons";

interface NotchedCardProps {
  children: ReactNode;
  className?: string;
  notchColor?: string;
}

/**
 * The recurring "notched card" brand motif (DESIGN-SYSTEM.md §1): a
 * diagonal-cut top-right corner holding a small chevron icon. Composed by
 * job cards, stat cards, company cards — none of them re-declare the
 * clip-path themselves.
 */
export function NotchedCard({ children, className = "", notchColor = "text-mist" }: NotchedCardProps) {
  return (
    <div
      className={`relative bg-white ${className}`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)",
      }}
    >
      <ChevronIcon className={`absolute right-1 top-1 h-3 w-3 -rotate-45 ${notchColor}`} />
      {children}
    </div>
  );
}
