"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeDocument } from "@/lib/api";
import { UploadCloud, FileText, Sparkles, AlertCircle } from "lucide-react";

export default function DocumentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Document Analyzer</h1>
        <p className="text-slate-600 text-sm">Upload a government notice, rejection letter, or civic contract (PDF, DOCX, TXT) to extract key dates, deadlines, and next actions.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-4 hover:border-primary/50 transition-colors bg-slate-50">
          <UploadCloud className="h-12 w-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500">PDF, DOCX, or TXT (Max 10MB)</p>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-200">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium truncate">{file.name}</span>
            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 text-sm"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Extracting Document & Deadlines...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Analyze Document Content
            </>
          )}
        </button>
      </form>
    </div>
  );
}
