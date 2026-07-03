"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

export function DealCountdown() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Box label="hrs" value={time.h} />
      <span className="text-lg font-bold text-amber-800">:</span>
      <Box label="min" value={time.m} />
      <span className="text-lg font-bold text-amber-800">:</span>
      <Box label="sec" value={time.s} />
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[46px] rounded-lg bg-gray-900 px-1.5 py-2 text-center text-white">
      <span className="block font-mono text-lg font-bold leading-none">{pad(value)}</span>
      <span className="text-[9px] uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  );
}