"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { analyzeProblem, parseApiError } from "@/lib/api";
import { Search, Loader2, AlertCircle, ChevronRight, Info } from "lucide-react";
=======
import { analyzeProblem } from "@/lib/api";
import { Search, Loader2, AlertCircle, ChevronRight, Sparkles, MapPin, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a

const DEMO_SCENARIOS = [
  {
    label: "Cyber Crime / UPI Fraud",
    text: "Someone fraudulently debited ₹75,000 from my bank account via unauthorized UPI requests and phishing link. The bank has delayed responding.",
    location: "Delhi",
  },
  {
    label: "Criminal / Police FIR Issue",
    text: "A neighbor assaulted my family member over parking dispute and threatened violence. The local police station is refusing to register our written FIR.",
    location: "Mumbai",
  },
  {
<<<<<<< HEAD
    label: "Motor Vehicle Accident",
    text: "My car was involved in an accident and I do not have insurance. What should I do?",
    category: "consumer",
  },
=======
    label: "Consumer Defective Product",
    text: "An online marketplace delivered a broken laptop and is refusing to issue a replacement or refund despite returning within 7 days.",
    location: "Bengaluru",
  },
  {
    label: "Tenant Illegal Eviction",
    text: "My landlord cut off water and electricity without notice and is demanding immediate eviction while withholding my ₹1,00,000 security deposit.",
    location: "Pune",
  },
  {
    label: "RTI Municipal Inquiry",
    text: "I want to inspect official fund allocation records, contractor tenders, and sanction files for local road construction in my ward under RTI Act.",
    location: "Kolkata",
  },
  {
    label: "Family Maintenance Dispute",
    text: "Seeking monthly maintenance and custody arrangement under Hindu Marriage Act / Section 125 CrPC / BNSS after marital desertion.",
    location: "Hyderabad",
  }
];

const POPULAR_CITIES = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Lucknow",
  "Chandigarh"
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
];

export default function AnalyzePage() {
  const router = useRouter();
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError("Please describe your problem or legal situation before continuing.");
      return;
    }
    // Prevent duplicate concurrent requests
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError("");
    setLoading(true);

    try {
<<<<<<< HEAD
      console.log("[LawLens] Sending analysis request to backend...", { problem: problem.slice(0, 80), category, location });
      const result = await analyzeProblem({ problem, category, location });
      console.log("[LawLens] Analysis successful, id:", result.id, "is_demo:", result.is_demo);
=======
      const result = await analyzeProblem({ problem, location });
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
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

  const loadDemoScenario = (text: string, loc: string) => {
    setProblem(text);
    setLocation(loc);
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">

      {/* Page header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Autonomous AI Legal Intelligence
        </div>
        <h1 className="page-title text-3xl font-bold tracking-tight text-text-primary">
          Legal Problem Analyzer
        </h1>
        <p className="page-subtitle mt-2 text-text-secondary text-sm leading-relaxed">
          Describe any civil, criminal, consumer, cyber, property, or administrative issue in plain language.
          LawLens AI will automatically predict the legal category, construct a step-by-step procedural roadmap,
          and recommend <span className="text-brand font-medium">5 verified real practicing advocates</span> in India (and in your city).
        </p>
      </div>

      {/* AI Category & Real Lawyer Feature Callout */}
      <div className="mb-6 p-4 rounded-lg bg-surface border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand/10 text-brand shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">
              Zero Manual Category Selection
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              AI automatically classifies BNS/BNSS, Consumer, Cyber, RTI, or Property law + connects top 5 real Indian lawyers.
            </p>
          </div>
        </div>
        <span className="badge-info text-[11px] shrink-0 font-medium flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Real Bar Advocates
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

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
        <div className="space-y-2">
          <label htmlFor="problem" className="block text-sm font-semibold text-text-primary">
            Describe Your Situation or Dispute
            <span className="text-brand ml-1">*</span>
          </label>
          <textarea
            id="problem"
            rows={6}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
<<<<<<< HEAD
            placeholder="e.g., My car was involved in an accident and I do not have insurance. What should I do?"
            className="input-base resize-none font-sans leading-relaxed"
            disabled={loading}
=======
            placeholder="e.g. Someone stole ₹85,000 via a fake banking app / My landlord illegally locked my flat / An e-commerce seller refuses to replace a damaged phone..."
            className="input-base resize-none font-sans leading-relaxed text-sm w-full p-4 rounded-md border border-surface-border bg-surface text-text-primary focus:border-brand focus:outline-none"
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
          />
          <p className="text-xs text-text-muted">
            Be as detailed as you like. AI analyzes the factual narrative, statutory violations, and remedies needed.
          </p>
        </div>

        {/* Location field */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="location" className="block text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" />
              Your City / State in India
              <span className="text-text-muted font-normal text-xs">(optional for local court jurisdiction)</span>
            </label>
<<<<<<< HEAD
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
=======
          </div>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune"
            className="input-base w-full p-3 rounded-md border border-surface-border bg-surface text-text-primary focus:border-brand focus:outline-none text-sm"
          />
          
          {/* Quick location selection tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-text-muted mr-1 font-medium">Quick Select:</span>
            {POPULAR_CITIES.map((city) => (
              <button
                type="button"
                key={city}
                onClick={() => setLocation(city)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  location.toLowerCase() === city.toLowerCase()
                    ? "bg-brand text-white border-brand font-medium"
                    : "bg-surface-raised border-surface-border text-text-secondary hover:text-text-primary hover:border-brand/40"
                }`}
              >
                {city}
              </button>
            ))}
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="analyze-submit"
<<<<<<< HEAD
          disabled={loading || !problem.trim()}
          className="btn-primary w-full py-3 text-sm"
=======
          disabled={loading}
          className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-md transition-all shadow-md hover:shadow-lg"
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
<<<<<<< HEAD
              Analyzing your situation &amp; rights…
=======
              <span>Predicting legal category, solutions &amp; fetching 5 verified advocates…</span>
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Analyze &amp; Suggest Top 5 Real Lawyers</span>
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
      <div className="mt-10 pt-8 border-t border-surface-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <p className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Explore Example Scenarios Across Legal Domains
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.label}
<<<<<<< HEAD
              type="button"
              onClick={() => loadDemoScenario(s.text, s.category)}
              disabled={loading}
              className="text-xs px-3.5 py-2 rounded-md bg-surface-raised border border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-borderHover transition-all duration-100 active:scale-[0.97] disabled:opacity-40"
=======
              onClick={() => loadDemoScenario(s.text, s.location)}
              className="text-left p-3 rounded-lg bg-surface border border-surface-border hover:border-brand/50 hover:bg-surface-raised transition-all group"
>>>>>>> 57e6df32de2413c62cf3a6f6a6b0e12d3c9da57a
            >
              <div className="flex items-center justify-between text-xs font-semibold text-text-primary mb-1">
                <span className="group-hover:text-brand transition-colors">{s.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-raised border border-surface-border text-text-muted">
                  {s.location}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {s.text}
              </p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
