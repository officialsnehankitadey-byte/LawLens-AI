"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeProblem } from "@/lib/api";
import { Search, Sparkles, AlertCircle } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("consumer");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError("Please describe your problem before continuing.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await analyzeProblem({ problem, category, location });
      localStorage.setItem(`analysis_${result.id}`, JSON.stringify(result));
      router.push(`/results/${result.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to complete analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoScenario = (demoText: string, demoCat: string) => {
    setProblem(demoText);
    setCategory(demoCat);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Problem Analyzer</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm">Describe your civic or legal issue in plain language to generate a guided action plan.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-sm flex items-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Describe Your Situation / Problem *
          </label>
          <textarea
            rows={5}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., An online seller delivered a damaged product and is refusing to refund my payment..."
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 text-sm"
            >
              <option value="consumer">Consumer Complaint</option>
              <option value="rti">RTI Request</option>
              <option value="scheme">Government Scheme / Service</option>
              <option value="tenant">Tenant / Landlord Dispute</option>
              <option value="notice">Government Notice / Rejection</option>
              <option value="other">Other Civic Issue</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">State / Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Delhi, Karnataka, Maharashtra"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 text-sm"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Analyzing Situation & Rights...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze My Situation
            </>
          )}
        </button>
      </form>

      {/* Demo Scenarios */}
      <div className="bg-slate-100 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Try Demo Scenarios</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadDemoScenario("An online seller delivered a damaged product and refuses to refund my payment.", "consumer")}
            className="text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary dark:hover:border-blue-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            🛒 Consumer Refund Dispute
          </button>
          <button
            onClick={() => loadDemoScenario("I want to request official fund allocation records for a local road construction project.", "rti")}
            className="text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary dark:hover:border-blue-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            📄 RTI Project Expenditure
          </button>
        </div>
      </div>
    </div>
  );
}
