"use client";

import { useEffect, useState } from "react";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeCountdown(deadline: string | null | undefined): CountdownValue {
  if (!deadline) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  }

  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

// Compte à rebours live jusqu'à une échéance, recalculé chaque minute
export function useCountdown(deadline: string | null | undefined): CountdownValue {
  const [value, setValue] = useState<CountdownValue>(() => computeCountdown(deadline));

  useEffect(() => {
    setValue(computeCountdown(deadline));

    if (!deadline) return;

    const interval = setInterval(() => {
      setValue(computeCountdown(deadline));
    }, 30_000);

    return () => clearInterval(interval);
  }, [deadline]);

  return value;
}

export function formatCountdown(value: CountdownValue): string {
  if (value.expired) return "Terminé";
  if (value.days > 0) return `${value.days}j ${value.hours}h`;
  if (value.hours > 0) return `${value.hours}h ${value.minutes}min`;
  return `${value.minutes}min`;
}
