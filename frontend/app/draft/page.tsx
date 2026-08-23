"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { generateDraft } from "@/lib/api";
import { DraftResponse } from "@/lib/types";
import { Copy, Download, RefreshCw, FileText, Check, AlertCircle, Loader2 } from "lucide-react";

function DraftForm() {
  const searchParams = useSearchParams();
  const draftType = searchParams.get("type") || "rti";
  const summaryParam = searchParams.get("summary") || "Sample grievance description regarding public service deficiency.";

  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const loadDraft = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generateDraft({
        draft_type: draftType,
        case_summary: summaryParam,
      });
      setDraft(result);
      setContent(result.content);
    } catch (err: any) {
      setError("Failed to generate draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
  }, [draftType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${draftType}_draft.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="section-label">Generated Document</p>
          <h1 className="page-title text-3xl">Draft Generator</h1>
          <p className="page-subtitle mt-1">Editable civic document draft — tailored for your situation.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            disabled={!content}
            id="draft-copy"
            className="btn-secondary text-xs gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success-text" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!content}
            id="draft-download"
            className="btn-primary text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-danger-muted border border-danger-border text-danger-text text-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Document panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-md bg-surface border border-surface-border">
          <Loader2 className="h-7 w-7 text-brand animate-spin" />
          <p className="text-sm text-text-secondary">Generating customised document draft…</p>
        </div>
      ) : (
        <div className="rounded-md bg-surface border border-surface-border overflow-hidden">

          {/* Document toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-border bg-surface-raised">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-7 w-7 rounded bg-brand/10 border border-brand/20">
                <FileText className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary leading-tight">
                  {draft?.title || "Civic Document Draft"}
                </p>
                <p className="text-xs text-text-muted capitalize">{draftType.replace(/_/g, " ")}</p>
              </div>
            </div>
            <button
              onClick={loadDraft}
              id="draft-regenerate"
              className="btn-ghost text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          {/* Editable content */}
          <textarea
            rows={22}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-6 font-mono text-sm bg-[#111111] text-text-primary placeholder:text-text-muted leading-relaxed focus:outline-none resize-none"
            placeholder="Your document draft will appear here…"
          />

          {/* Placeholders note */}
          {draft?.placeholders_used && draft.placeholders_used.length > 0 && (
            <div className="px-5 py-3.5 border-t border-surface-border bg-warning-muted/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-warning-text shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-warning-text">Placeholders to replace before submitting:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {draft.placeholders_used.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface-raised border border-warning-border text-warning-text font-mono text-[11px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {draft?.disclaimer && (
            <div className="px-5 py-3.5 border-t border-surface-border">
              <p className="text-xs text-text-muted italic text-center">{draft.disclaimer}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function DraftPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-brand animate-spin mx-auto" />
          <p className="text-sm text-text-secondary">Loading draft generator…</p>
        </div>
      </div>
    }>
      <DraftForm />
    </Suspense>
  );
}
