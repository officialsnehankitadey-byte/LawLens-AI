"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, Trash2, ArrowRight, ShieldAlert } from "lucide-react";

interface HistoryItem {
  id: string;
  detected_issue: string;
  category: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const items: HistoryItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("analysis_")) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "");
          items.push({
            id: val.id,
            detected_issue: val.detected_issue || "Civic Analysis",
            category: val.category || "General",
            timestamp: new Date().toLocaleDateString("en-IN"),
          });
        } catch {
          // ignore parsing errors
        }
      }
    }
    setHistory(items);
  }, []);

  const clearHistory = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("analysis_") || key.startsWith("doc_analysis_"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setHistory([]);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <HistoryIcon className="h-7 w-7 text-primary" />
            Analysis History
          </h1>
          <p className="text-slate-600 text-sm">View recent civic problem analyses saved locally in your browser.</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-800">No History Saved</h3>
            <p className="text-sm text-slate-500">You haven't run any problem or document analyses yet.</p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Analyze First Problem
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded uppercase">
                  {item.category}
                </span>
                <h3 className="font-semibold text-slate-900 text-base">{item.detected_issue}</h3>
              </div>
              <Link
                href={`/results/${item.id}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View Results
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
