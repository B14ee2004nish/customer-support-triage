import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CursorTrail from '@/components/CursorTrail';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Customer Support Ticket Triage System | Gemini & Supabase',
  description:
    'AI-powered automated ticket categorization, priority assessment, and human-in-the-loop review system with Gemini 1.5 Flash and Supabase PostgreSQL.',
  openGraph: {
    title: 'Customer Support Ticket Triage System',
    description:
      'AI-powered automated ticket triage and human review workflow built with Next.js 14, Supabase, and Gemini 1.5 Flash.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Support Ticket Triage System',
    description: 'AI-powered autonomous triage with human-in-the-loop oversight.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white`}>
        {/* Animated 60fps glowing particle cursor trail */}
        <CursorTrail />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="w-full border-t border-white/5 py-6 backdrop-blur-md bg-slate-950/40 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Customer Support Ticket Triage System • Northwind Retail Enterprise</span>
            <div className="flex items-center gap-3 text-slate-400">
              <span>Next.js 14 App Router</span>
              <span>•</span>
              <span>Supabase PostgreSQL</span>
              <span>•</span>
              <span>Gemini 1.5 Flash</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
