"use client";

import { Clock } from "lucide-react";
import { useCountdown, formatCountdown } from "@/hooks/useCountdown";

export function CountdownBadge({
  deadline,
  className = "",
}: {
  deadline: string | null | undefined;
  className?: string;
}) {
  const countdown = useCountdown(deadline);

  if (!deadline) return null;

  const urgent = !countdown.expired && countdown.days === 0 && countdown.hours < 24;
  const soon = !countdown.expired && countdown.days < 3;

  const colorClasses = countdown.expired
    ? "bg-foreground/5 text-foreground/30 border-foreground/10"
    : urgent
    ? "bg-red-500/15 text-red-300 border-red-500/30"
    : soon
    ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
    : "bg-rose-400/10 text-rose-300 border-rose-400/20";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colorClasses} ${className}`}
    >
      <Clock className="size-3.5" />
      {formatCountdown(countdown)}
    </span>
  );
}
