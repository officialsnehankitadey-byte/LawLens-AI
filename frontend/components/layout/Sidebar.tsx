"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Search, BookOpen, History, Info, Scale } from "lucide-react";

interface SidebarProps {
  open: boolean;
  isPinned: boolean;
  toggleSidebar: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function Sidebar({
  open,
  isPinned,
  toggleSidebar,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Analyze Problem",  href: "/analyze",  icon: Search },
    { label: "Upload Document",  href: "/document",  icon: FileText },
    { label: "Draft Generator",  href: "/draft",     icon: BookOpen },
    { label: "History",          href: "/history",   icon: History },
    { label: "About",            href: "/about",     icon: Info },
  ];

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#0E0E0E] border-r border-surface-border shadow-panel-lg transform transition-transform duration-300 ease-in-out flex flex-col pt-14 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand area inside sidebar */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded bg-brand shrink-0">
            <Scale className="h-3.5 w-3.5 text-base-950" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Navigation</span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                }`}
              >
                {/* Active indicator */}
                <div className={`w-0.5 h-4 rounded-full transition-all duration-150 shrink-0 ${
                  isActive ? "bg-brand" : "bg-transparent group-hover:bg-surface-border"
                }`} />
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-brand" : "text-text-muted group-hover:text-text-secondary"
                }`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {isPinned ? "Sidebar pinned" : "Hover preview"}
          </span>
          <button
            onClick={toggleSidebar}
            className="text-xs font-medium text-brand hover:text-brand-light transition-colors"
          >
            {isPinned ? "Unpin" : "Pin open"}
          </button>
        </div>
      </div>
    </aside>
  );
}
