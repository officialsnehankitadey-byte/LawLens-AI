"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { generateDraft } from "@/lib/api";
import { DraftResponse } from "@/lib/types";
import { Copy, Download, RefreshCw, FileText, Check, AlertCircle } from "lucide-react";

export default function DraftPage() {
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
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Draft Generator</h1>
          <p className="text-slate-600 text-sm">Editable civic document draft tailored for your problem.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Text"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!content}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Text
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Generating customized document draft...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              {draft?.title || "Civic Document Draft"}
            </h2>
            <button
              onClick={loadDraft}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          <textarea
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 font-mono text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-slate-800"
          />

          {draft?.placeholders_used && draft.placeholders_used.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
              <strong>Placeholders to replace:</strong>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.placeholders_used.map((p, i) => (
                  <span key={i} className="bg-white px-2 py-0.5 rounded border border-amber-300 font-mono">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center italic">{draft?.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
