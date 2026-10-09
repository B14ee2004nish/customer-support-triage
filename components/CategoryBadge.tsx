'use client';

import React from 'react';
import { TicketCategory } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/constants';
import {
  CreditCard,
  Cpu,
  UserCheck,
  Truck,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: TicketCategory | string | null | undefined;
  size?: 'sm' | 'md';
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Billing: <CreditCard className="w-3.5 h-3.5" />,
  Technical: <Cpu className="w-3.5 h-3.5" />,
  Account: <UserCheck className="w-3.5 h-3.5" />,
  Shipping: <Truck className="w-3.5 h-3.5" />,
  Refunds: <RotateCcw className="w-3.5 h-3.5" />,
  General: <HelpCircle className="w-3.5 h-3.5" />,
};

export default function CategoryBadge({
  category,
  size = 'md',
}: CategoryBadgeProps) {
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/60 text-slate-400 border border-slate-700/40">
        Uncategorized
      </span>
    );
  }

  const validCategory = category as TicketCategory;
  const config =
    CATEGORY_COLORS[validCategory] || CATEGORY_COLORS.General;
  const icon = CATEGORY_ICONS[validCategory] || <HelpCircle className="w-3.5 h-3.5" />;

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${config.bg} ${config.text} ${config.border} ${sizeClass}`}
    >
      {icon}
      <span>{category}</span>
    </span>
  );
}
