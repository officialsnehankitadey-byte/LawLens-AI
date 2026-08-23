"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      if (!next) {
        setIsHovered(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
      return next;
    });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  // Sidebar is open if either statically pinned (clicked) or currently hovered
  const showSidebar = isPinned || isHovered;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        toggleSidebar={togglePin}
        toggleTheme={toggleTheme}
        isDark={isDark}
        isPinned={isPinned}
        onButtonMouseEnter={handleMouseEnter}
        onButtonMouseLeave={handleMouseLeave}
      />

      <Sidebar
        open={showSidebar}
        isPinned={isPinned}
        toggleSidebar={togglePin}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Main Screen shifts right ONLY when statically open (clicked / pinned) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isPinned ? "md:ml-64" : "ml-0"
        }`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
