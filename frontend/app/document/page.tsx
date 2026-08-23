"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeDocument, parseApiError } from "@/lib/api";
import { UploadCloud, FileText, Loader2, AlertCircle, X, Info } from "lucide-react";

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

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }

    const allowedTypes = [".pdf", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError(`Unsupported file type "${ext}". Please upload a PDF, DOCX, or TXT file.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("[LawLens] Uploading document:", file.name, file.size);
      const result = await analyzeDocument(file);
      console.log("[LawLens] Document analysis successful, id:", result.id);
      localStorage.setItem(`doc_analysis_${result.id}`, JSON.stringify(result));
      router.push(`/results/doc_${result.id}`);
    } catch (err: unknown) {
      const msg = parseApiError(err);
      console.error("[LawLens] Document upload failed:", err);
      setError(msg);
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

        {/* Error Banner */}
        {error && (
          <div className="rounded-md bg-danger-muted border border-danger-border animate-fade-in">
            <div className="flex items-start gap-2.5 p-3.5">
              <AlertCircle className="h-4 w-4 text-danger-text shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-danger-text mb-1">Upload failed</p>
                {error.split("\n\n").map((line, i) => (
                  <p key={i} className={`text-xs leading-relaxed ${i === 0 ? "text-danger-text" : "text-text-muted font-mono mt-1"}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload zone */}
        <label
          htmlFor="file-upload"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          } ${
            isDragOver
              ? "border-brand bg-brand-muted scale-[1.01]"
              : "border-surface-border bg-surface hover:border-brand hover:bg-surface-raised"
          }`}
        >
          <div className={`flex items-center justify-center h-12 w-12 rounded-full border border-surface-border transition-colors duration-200 ${
            isDragOver ? "bg-brand-muted border-brand" : "bg-surface-raised"
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
            disabled={loading}
          />
        </label>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-md bg-surface-raised border border-surface-border animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center h-8 w-8 rounded bg-brand-muted border border-brand shrink-0">
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
              disabled={loading}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors shrink-0 disabled:opacity-40"
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

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-surface-raised border border-surface-border animate-fade-in">
            <Info className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <p className="text-xs text-text-muted">
              Document analysis may take up to 30 seconds. Please wait…
            </p>
          </div>
        )}
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
