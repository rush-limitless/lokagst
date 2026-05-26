"use client";

import { useEffect, useState } from "react";

export function Confetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 6],
      delay: Math.random() * 2,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{ left: `${p.x}%`, backgroundColor: p.color, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}
