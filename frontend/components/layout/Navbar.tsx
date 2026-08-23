"use client";

import Link from "next/link";
import { Scale, Menu, X, Sun, Moon } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
  isPinned?: boolean;
  onButtonMouseEnter?: () => void;
  onButtonMouseLeave?: () => void;
  theme?: "dark" | "light";
  toggleTheme?: () => void;
}

export default function Navbar({
  toggleSidebar,
  isPinned = false,
  onButtonMouseEnter,
  onButtonMouseLeave,
  theme = "dark",
  toggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-base-900/95 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">

        {/* Left: Menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            onMouseEnter={onButtonMouseEnter}
            onMouseLeave={onButtonMouseLeave}
            aria-label="Toggle navigation panel"
            title={isPinned ? "Unpin sidebar" : "Hover to preview, click to pin"}
            className={`p-1.5 rounded-md transition-all duration-100 active:scale-95 cursor-pointer ${
              isPinned
                ? "text-brand bg-brand/10"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            {isPinned ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 select-none active:scale-[0.98] transition-transform duration-100">
            <div className="flex items-center justify-center h-7 w-7 rounded bg-brand text-text-inverse">
              <Scale className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">
              LawLens <span className="text-brand">AI</span>
            </span>
          </Link>
        </div>

        {/* Right: Theme Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-surface-border bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-overlay hover:border-surface-borderHover active:scale-[0.96] transition-all duration-100 text-xs font-medium cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-brand shrink-0" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-brand shrink-0" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thin brand accent line at the very bottom of navbar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
    </header>
  );
}
