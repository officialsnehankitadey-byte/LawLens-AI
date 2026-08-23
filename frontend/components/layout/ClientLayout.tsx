"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(saved);
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
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

  const handleItemClick = () => {
    if (!isPinned) {
      setIsHovered(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  // Sidebar is open if either statically pinned (clicked) or currently hovered
  const showSidebar = isPinned || isHovered;

  return (
    <div className="min-h-screen flex flex-col bg-base-900 text-text-primary transition-colors duration-200">
      <Navbar
        toggleSidebar={togglePin}
        isPinned={isPinned}
        onButtonMouseEnter={handleMouseEnter}
        onButtonMouseLeave={handleMouseLeave}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <Sidebar
        open={showSidebar}
        isPinned={isPinned}
        toggleSidebar={togglePin}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onItemClick={handleItemClick}
      />

      {/* Main content shifts right ONLY when statically pinned */}
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
