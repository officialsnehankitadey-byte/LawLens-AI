"use client";

import Link from "next/link";
import { Scale, Menu, X } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
  isPinned?: boolean;
  onButtonMouseEnter?: () => void;
  onButtonMouseLeave?: () => void;
}

export default function Navbar({
  toggleSidebar,
  isPinned = false,
  onButtonMouseEnter,
  onButtonMouseLeave,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-base-900/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">

        {/* Left: Menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            onMouseEnter={onButtonMouseEnter}
            onMouseLeave={onButtonMouseLeave}
            aria-label="Toggle navigation panel"
            title={isPinned ? "Unpin sidebar" : "Hover to preview, click to pin"}
            className={`p-1.5 rounded-md transition-all duration-150 ${
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

          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="flex items-center justify-center h-7 w-7 rounded bg-brand">
              <Scale className="h-4 w-4 text-base-950" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">
              LawLens <span className="text-brand">AI</span>
            </span>
          </Link>
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            id="navbar-cta"
            className="btn-primary text-xs px-3 py-2"
          >
            Start Analysis
          </Link>
        </div>
      </div>

      {/* Thin brand accent line at the very bottom of navbar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
    </header>
  );
}
