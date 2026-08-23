"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { analyzeProblem, parseApiError } from "@/lib/api";
import { Search, Loader2, AlertCircle, ChevronRight, Info } from "lucide-react";

const DEMO_SCENARIOS = [
  {
    label: "Consumer Refund Dispute",
    text: "An online seller delivered a damaged product and refuses to refund my payment.",
    category: "consumer",
  },
  {
    label: "RTI Project Expenditure",
    text: "I want to request official fund allocation records for a local road construction project.",
    category: "rti",
  },
  {
    label: "Motor Vehicle Accident",
    text: "My car was involved in an accident and I do not have insurance. What should I do?",
    category: "consumer",
  },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("consumer");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError("Please describe your problem before continuing.");
      return;
    }
    // Prevent duplicate concurrent requests
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError("");
    setLoading(true);

    try {
      console.log("[LawLens] Sending analysis request to backend...", { problem: problem.slice(0, 80), category, location });
      const result = await analyzeProblem({ problem, category, location });
      console.log("[LawLens] Analysis successful, id:", result.id, "is_demo:", result.is_demo);
      localStorage.setItem(`analysis_${result.id}`, JSON.stringify(result));
      router.push(`/results/${result.id}`);
    } catch (err: unknown) {
      const msg = parseApiError(err);
      console.error("[LawLens] Analysis failed:", err);
      setError(msg);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const loadDemoScenario = (text: string, cat: string) => {
    setProblem(text);
    setCategory(cat);
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">

      {/* Page header */}
      <div className="mb-8 space-y-1">
        <p className="section-label">Civic Analysis</p>
        <h1 className="page-title text-3xl">Problem Analyzer</h1>
        <p className="page-subtitle mt-2">
          Describe your civic or legal issue in plain language to receive a guided action plan, applicable rights, and an editable draft.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error Banner */}
        {error && (
          <div className="rounded-md bg-danger-muted border border-danger-border animate-fade-in">
            <div className="flex items-start gap-2.5 p-3.5">
              <AlertCircle className="h-4 w-4 text-danger-text shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-danger-text mb-1">Unable to complete analysis</p>
                {error.split("\n\n").map((line, i) => (
                  <p key={i} className={`text-xs leading-relaxed ${i === 0 ? "text-danger-text" : "text-text-muted font-mono mt-1"}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Situation field */}
        <div className="space-y-1.5">
          <label htmlFor="problem" className="block text-sm font-medium text-text-primary">
            Describe Your Situation
            <span className="text-brand ml-1">*</span>
          </label>
          <textarea
            id="problem"
            rows={6}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., My car was involved in an accident and I do not have insurance. What should I do?"
            className="input-base resize-none font-sans leading-relaxed"
            disabled={loading}
          />
          <p className="text-xs text-text-muted">
            Be specific — include what happened, who is involved, and when.
          </p>
        </div>

        {/* Category + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-medium text-text-primary">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-base"
              disabled={loading}
            >
              <option value="consumer">Consumer Complaint</option>
              <option value="rti">RTI Request</option>
              <option value="scheme">Government Scheme / Service</option>
              <option value="tenant">Tenant / Landlord Dispute</option>
              <option value="notice">Government Notice / Rejection</option>
              <option value="other">Other Civic Issue</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="location" className="block text-sm font-medium text-text-primary">
              State / Location
              <span className="text-text-muted ml-1.5 font-normal text-xs">(optional)</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Delhi, Karnataka, Maharashtra"
              className="input-base"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="analyze-submit"
          disabled={loading || !problem.trim()}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your situation &amp; rights…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze My Situation
              <ChevronRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </button>

        {/* Loading note */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-surface-raised border border-surface-border animate-fade-in">
            <Info className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <p className="text-xs text-text-muted">
              Analysis may take 15–30 seconds if the AI service is active. Please wait…
            </p>
          </div>
        )}
      </form>

      {/* Demo scenarios */}
      <div className="mt-8 pt-7 border-t border-surface-border">
        <p className="section-label mb-3">Try a Demo Scenario</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => loadDemoScenario(s.text, s.category)}
              disabled={loading}
              className="text-xs px-3.5 py-2 rounded-md bg-surface-raised border border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-borderHover transition-all duration-100 active:scale-[0.97] disabled:opacity-40"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
