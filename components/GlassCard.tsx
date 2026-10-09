'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradientBorder?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  gradientBorder = false,
  hoverEffect = true,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl backdrop-blur-xl bg-slate-900/40 border transition-all duration-300 ${
        gradientBorder
          ? 'border-transparent before:absolute before:-inset-[1px] before:rounded-2xl before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:-z-10 before:opacity-75 before:blur-[1px] hover:before:opacity-100'
          : 'border-white/10 hover:border-white/20'
      } ${
        hoverEffect
          ? 'hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/10'
          : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
