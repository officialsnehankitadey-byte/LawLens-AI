"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SituationAnalysisResponse } from "@/lib/types";
import { CheckCircle, AlertTriangle, FileText, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SituationAnalysisResponse | null>(null);

  useEffect(() => {
    if (params?.id) {
      const stored = localStorage.getItem(`analysis_${params.id}`);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch {
          console.error("Failed to parse stored analysis");
        }
      }
    }
  }, [params?.id]);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Analysis Not Found</h2>
        <p className="text-sm text-slate-500">The requested analysis result could not be found locally.</p>
        <button
          onClick={() => router.push("/analyze")}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            {data.category} Analysis
          </span>
          {data.is_demo && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
              Demo / Fallback Mode
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{data.detected_issue}</h1>
        <p className="text-slate-600 text-sm">{data.situation_summary}</p>
      </div>

      {/* Applicable Rights / Schemes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Potentially Applicable Rights & Schemes
        </h2>
        
        <div className="grid gap-4">
          {data.applicable_rights_or_schemes.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-semibold text-slate-800 text-base">{item.topic}</h3>
              <p className="text-sm text-slate-600">{item.explanation}</p>
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <strong>Why relevant:</strong> {item.relevance_reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          Step-by-Step Action Plan
        </h2>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-sm font-medium">
          <strong>Immediate Action:</strong> {data.action_plan.immediate_action}
        </div>

        <div className="space-y-3">
          {data.action_plan.ordered_steps.map((step) => (
            <div key={step.step_number} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                {step.step_number}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
                <p className="text-xs text-slate-500"><strong>Why it matters:</strong> {step.why_it_matters}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Required Documents Checklist</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {data.action_plan.required_documents.map((doc, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA to Generate Draft */}
      <div className="bg-blue-900 text-white p-6 rounded-xl space-y-4 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Ready to take action?</h3>
          <p className="text-xs text-blue-200">Generate an editable draft application or complaint customized for your situation.</p>
        </div>
        <button
          onClick={() => router.push(`/draft?type=${data.recommended_draft_type || "consumer_complaint"}&summary=${encodeURIComponent(data.situation_summary)}`)}
          className="px-5 py-2.5 bg-accent hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <FileText className="h-4 w-4" />
          Generate Editable Draft
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 text-center italic">{data.disclaimer}</p>
    </div>
  );
}
