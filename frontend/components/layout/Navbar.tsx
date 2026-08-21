"use client";

import Link from "next/link";
import { FileText, ShieldAlert, BookOpen, History, Info, Compass } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Compass className="h-6 w-6 text-accent" />
          <span>LawLens <span className="text-accent">AI</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/analyze" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            Analyze Problem
          </Link>
          <Link href="/document" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Upload Document
          </Link>
          <Link href="/draft" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Draft Generator
          </Link>
          <Link href="/history" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <History className="h-4 w-4" />
            History
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
