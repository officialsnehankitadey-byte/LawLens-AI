"use client";

import Link from "next/link";
import { Compass, Menu, Sun, Moon } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
  toggleTheme: () => void;
  isDark: boolean;
  isPinned?: boolean;
  onButtonMouseEnter?: () => void;
  onButtonMouseLeave?: () => void;
}

export default function Navbar({
  toggleSidebar,
  toggleTheme,
  isDark,
  isPinned = false,
  onButtonMouseEnter,
  onButtonMouseLeave,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger (Three-dash line) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            onMouseEnter={onButtonMouseEnter}
            onMouseLeave={onButtonMouseLeave}
            aria-label="Toggle Left Navigation Panel"
            title={isPinned ? "Click to unlock sidebar" : "Hover to preview, click to pin open"}
            className={`p-2 rounded-lg transition-colors border ${
              isPinned
                ? "border-primary bg-primary/10 text-primary dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary dark:text-blue-400">
            <Compass className="h-6 w-6 text-accent" />
            <span>LawLens <span className="text-accent">AI</span></span>
          </Link>
        </div>

        {/* Right: Night/Light Theme Toggle + Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>

          <Link
            href="/analyze"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 h-9 px-4 py-2 shadow-sm"
          >
            Start Analysis
          </Link>
        </div>
      </div>
    </header>
  );
}
