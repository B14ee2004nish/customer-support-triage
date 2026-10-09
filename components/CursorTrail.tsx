'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const SPARKLE_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export default function CursorTrail() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawnTime = useRef<number>(0);
  const counterRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only activate on devices with fine pointer (mouse); disable on touch devices
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // Throttle to 1 sparkle per 50ms
      if (now - lastSpawnTime.current < 50) return;
      lastSpawnTime.current = now;

      // Random color selection from the defined palette
      const color =
        SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      // Size: 4-6px
      const size = Math.floor(Math.random() * 3) + 4;
      // Slight random offset (±3px)
      const offsetX = (Math.random() - 0.5) * 6;
      const offsetY = (Math.random() - 0.5) * 6;

      const id = ++counterRef.current;
      const newSparkle: Sparkle = {
        id,
        x: e.clientX + offsetX,
        y: e.clientY + offsetY,
        size,
        color,
      };

      setSparkles((prev) => [...prev, newSparkle]);

      // Clean up sparkle from state after 700ms
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 700);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="sparkle-particle absolute rounded-full pointer-events-none"
          style={{
            left: `${sparkle.x}px`,
            top: `${sparkle.y}px`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 6px ${sparkle.color}, 0 0 10px ${sparkle.color}80`,
          }}
        />
      ))}
    </div>
  );
}
