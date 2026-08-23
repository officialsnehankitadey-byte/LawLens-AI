"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeProblem } from "@/lib/api";
import { Search, Loader2, AlertCircle, ChevronRight } from "lucide-react";

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
];

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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-md bg-danger-muted border border-danger-border text-danger-text text-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
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
            placeholder="e.g., An online seller delivered a damaged product and is refusing to refund my payment despite multiple follow-ups…"
            className="input-base resize-none font-sans leading-relaxed"
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
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="analyze-submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing situation &amp; rights…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze My Situation
              <ChevronRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </button>
      </form>

      {/* Demo scenarios */}
      <div className="mt-8 pt-7 border-t border-surface-border">
        <p className="section-label mb-3">Try a Demo Scenario</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.label}
              onClick={() => loadDemoScenario(s.text, s.category)}
              className="text-xs px-3.5 py-2 rounded-md bg-surface-raised border border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-borderHover transition-all duration-150"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
