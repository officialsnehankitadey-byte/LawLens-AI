"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeDocument } from "@/lib/api";
import { UploadCloud, FileText, Loader2, AlertCircle, X } from "lucide-react";

export default function DocumentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await analyzeDocument(file);
      localStorage.setItem(`doc_analysis_${result.id}`, JSON.stringify(result));
      router.push(`/results/doc_${result.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to analyze document.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => setFile(null);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">

      {/* Page header */}
      <div className="mb-8 space-y-1">
        <p className="section-label">Document Intelligence</p>
        <h1 className="page-title text-3xl">Document Analyzer</h1>
        <p className="page-subtitle mt-2">
          Upload a government notice, rejection letter, or civic contract to extract key dates, deadlines, required actions, and relevant rights.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-danger-muted border border-danger-border text-danger-text text-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload zone */}
        <label
          htmlFor="file-upload"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-brand bg-brand/8 scale-[1.01]"
              : "border-surface-border bg-surface hover:border-brand/40 hover:bg-brand/4"
          }`}
        >
          <div className={`flex items-center justify-center h-12 w-12 rounded-full border border-surface-border transition-colors duration-200 ${
            isDragOver ? "bg-brand/15 border-brand/40" : "bg-surface-raised"
          }`}>
            <UploadCloud className={`h-6 w-6 transition-colors duration-200 ${isDragOver ? "text-brand" : "text-text-muted"}`} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-text-primary">
              Drop your file here, or{" "}
              <span className="text-brand underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-text-muted">PDF, DOCX, or TXT — maximum 10 MB</p>
          </div>

          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-md bg-surface-raised border border-surface-border animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center h-8 w-8 rounded bg-brand/10 border border-brand/20 shrink-0">
                <FileText className="h-4 w-4 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors shrink-0"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          id="document-submit"
          disabled={loading || !file}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting content &amp; deadlines…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Analyze Document
            </>
          )}
        </button>
      </form>

      {/* Supported types note */}
      <div className="mt-8 pt-7 border-t border-surface-border">
        <p className="section-label mb-3">Supported Document Types</p>
        <div className="flex flex-wrap gap-2">
          {["Government Notices", "Rejection Letters", "RTI Responses", "Tax Notices", "Civic Contracts", "Legal Letters"].map((t) => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-md bg-surface-raised border border-surface-border text-text-secondary">
              {t}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
