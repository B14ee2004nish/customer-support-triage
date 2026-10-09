'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Inbox,
  AlertCircle,
  BarChart3,
  PlusCircle,
  Database,
  Layers,
  X,
  Menu,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    tableReady: boolean;
    message: string;
  }>({
    configured: false,
    tableReady: false,
    message: 'Checking...',
  });

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data?.stats) {
        setReviewCount(data.stats.inReviewTickets);
      }
      if (data?.dbStatus) {
        setDbStatus(data.dbStatus);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { href: '/tickets', label: 'Tickets Queue', icon: <Inbox className="w-4 h-4" /> },
    {
      href: '/review',
      label: 'Human Review',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  TriageAI
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400 border border-slate-700/60 bg-slate-900/80 px-2 py-0.5 rounded-full">
                  Gemini 1.5 + Supabase
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10 shadow-sm border border-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* DB status indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${
                dbStatus.tableReady
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : dbStatus.configured
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
              title={
                dbStatus.tableReady
                  ? 'Connected: Supabase PostgreSQL tables active'
                  : dbStatus.configured
                  ? 'Supabase Connected: run schema.sql in Supabase SQL Editor to activate tables'
                  : 'Operating in self-contained store'
              }
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>{dbStatus.message}</span>
            </div>

            {/* Create Ticket Button */}
            <Link
              href="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ticket</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/tickets/new"
              className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              title="Create Ticket"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
