"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ShieldAlert, BookOpen, History, Info, Compass, X } from "lucide-react";

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
    { label: "Analyze Problem", href: "/analyze", icon: ShieldAlert },
    { label: "Upload Document", href: "/document", icon: FileText },
    { label: "Draft Generator", href: "/draft", icon: BookOpen },
    { label: "History", href: "/history", icon: History },
    { label: "About", href: "/about", icon: Info },
  ];

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary dark:text-blue-400">
          <Compass className="h-6 w-6 text-accent" />
          <span>LawLens <span className="text-accent">AI</span></span>
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label="Close Navigation Panel"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Options List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto font-medium text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-sm dark:bg-blue-600"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>{isPinned ? "📌 Statically Open" : "👁️ Hover Preview"}</span>
        <button
          onClick={toggleSidebar}
          className="text-xs font-semibold text-primary dark:text-blue-400 hover:underline"
        >
          {isPinned ? "Unpin" : "Pin Open"}
        </button>
      </div>
    </aside>
  );
}
