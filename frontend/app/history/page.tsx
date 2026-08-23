"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History as HistoryIcon, Trash2, ArrowRight, Search, FileText } from "lucide-react";

interface HistoryItem {
  id: string;
  detected_issue: string;
  category: string;
  timestamp: string;
  isDocument: boolean;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const items: HistoryItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("analysis_") || key.startsWith("doc_analysis_"))) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "");
          const isDoc = key.startsWith("doc_analysis_") || "filename" in val;
          const rawId = val.id || key.replace(/^(analysis_|doc_analysis_)/, "");
          const docId = rawId.startsWith("doc_") ? rawId : `doc_${rawId}`;
          items.push({
            id: isDoc ? docId : rawId,
            detected_issue: isDoc
              ? (val.filename || val.identified_issues?.[0] || "Document Analysis")
              : (val.detected_issue || "Civic Analysis"),
            category: isDoc ? (val.document_type || "Document") : (val.category || "General"),
            timestamp: new Date().toLocaleDateString("en-IN"),
            isDocument: isDoc,
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 space-y-8">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="section-label">Browser Storage</p>
          <h1 className="page-title text-3xl flex items-center gap-2.5">
            <HistoryIcon className="h-7 w-7 text-brand" />
            Analysis History
          </h1>
          <p className="page-subtitle mt-1">
            Recent civic and document analyses saved locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            id="history-clear"
            className="btn-danger text-xs shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-20 rounded-md bg-surface border border-surface-border text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-surface-raised border border-surface-border">
            <HistoryIcon className="h-7 w-7 text-text-muted" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-text-primary">No History Yet</h3>
            <p className="text-sm text-text-secondary max-w-xs mx-auto">
              You haven&apos;t run any problem or document analyses yet.
            </p>
          </div>
          <Link href="/analyze" id="history-start-cta" className="btn-primary text-sm">
            Analyze First Problem
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Count */}
          <p className="text-xs text-text-muted mb-4">{history.length} saved {history.length === 1 ? "analysis" : "analyses"}</p>

          {history.map((item, idx) => (
            <div
              key={item.id}
              className="group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-md bg-surface border border-surface-border hover:border-surface-borderHover transition-all duration-150 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Icon */}
                <div className="flex items-center justify-center h-9 w-9 rounded bg-surface-raised border border-surface-border shrink-0">
                  {item.isDocument
                    ? <FileText className="h-4 w-4 text-text-muted" />
                    : <Search className="h-4 w-4 text-text-muted" />
                  }
                </div>

                {/* Content */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge-neutral uppercase text-[10px] tracking-wide">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-text-muted">{item.timestamp}</span>
                  </div>
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {item.detected_issue}
                  </h3>
                </div>
              </div>

              <Link
                href={`/results/${item.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted group-hover:text-brand transition-colors shrink-0"
              >
                View
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
