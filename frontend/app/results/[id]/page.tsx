"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SituationAnalysisResponse, DocumentAnalysisResponse } from "@/lib/types";
import { CheckCircle, AlertTriangle, FileText, ArrowRight, ShieldCheck, Clock, Calendar, ExternalLink } from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SituationAnalysisResponse | DocumentAnalysisResponse | null>(null);

  useEffect(() => {
    if (params?.id) {
      const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
      const cleanId = rawId.replace(/^doc_/, "");

      const possibleKeys = [
        `doc_analysis_${cleanId}`,
        `doc_analysis_${rawId}`,
        `analysis_${rawId}`,
        `analysis_${cleanId}`,
      ];

      let stored: string | null = null;
      for (const key of possibleKeys) {
        stored = localStorage.getItem(key);
        if (stored) break;
      }

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

  const isDocumentAnalysis = (
    item: SituationAnalysisResponse | DocumentAnalysisResponse
  ): item is DocumentAnalysisResponse => {
    return "filename" in item || "extracted_facts" in item || "explicit_deadlines" in item;
  };

  if (isDocumentAnalysis(data)) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              {data.document_type || "Document Analysis"}
            </span>
            {data.is_demo && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                Demo / Fallback Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{data.filename}</h1>
          <p className="text-slate-600 text-sm">{data.summary}</p>
        </div>

        {/* Identified Issues */}
        {data.identified_issues && data.identified_issues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Identified Issues & Key Findings
            </h2>
            <div className="grid gap-3">
              {data.identified_issues.map((issue, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-800 flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates and Deadlines */}
        {((data.explicit_deadlines && data.explicit_deadlines.length > 0) || (data.explicit_dates && data.explicit_dates.length > 0)) && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Important Dates & Deadlines
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.explicit_deadlines && data.explicit_deadlines.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl space-y-2">
                  <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-700" />
                    Explicit Deadlines
                  </h3>
                  <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                    {data.explicit_deadlines.map((dl, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                        <span>{dl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.explicit_dates && data.explicit_dates.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    Mentioned Dates
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {data.explicit_dates.map((dt, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        <span>{dt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extracted Facts */}
        {data.extracted_facts && data.extracted_facts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-700" />
              Extracted Key Facts
            </h2>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              {data.extracted_facts.map((fact, idx) => (
                <div key={idx} className="flex items-start justify-between text-sm border-b border-slate-100 last:border-0 pb-2.5 last:pb-0">
                  <span className="text-slate-800">{fact.fact}</span>
                  {fact.confidence && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded shrink-0 ml-3">
                      {fact.confidence} confidence
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {data.recommended_actions && data.recommended_actions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Recommended Actions
            </h2>
            <div className="space-y-3">
              {data.recommended_actions.map((act, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 text-sm text-slate-800">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents Checklist — grounded to extracted document text */}
        {data.required_documents && data.required_documents.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Documents Requested in This Notice
            </h3>
            <p className="text-xs text-slate-500">The following documents were explicitly requested in the uploaded document:</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {data.required_documents.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className="bg-blue-900 text-white p-6 rounded-xl space-y-4 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Need a formal document response?</h3>
            <p className="text-xs text-blue-200">Generate an editable draft representation or appeal based on this document.</p>
          </div>
          <button
            onClick={() => router.push(`/draft?type=${data.recommended_draft_type || "appeal"}&summary=${encodeURIComponent(data.summary)}`)}
            className="px-5 py-2.5 bg-accent hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition-colors shrink-0 flex items-center gap-2 shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Generate Editable Draft
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-base">{item.topic}</h3>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Verified Official Source
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-600">{item.explanation}</p>
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <strong>Why relevant:</strong> {item.relevance_reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Official Sources & Legal Citations */}
      {data.sources && data.sources.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Verified Official Legal Citations & Sources
          </h2>
          <div className="grid gap-3">
            {data.sources.map((src, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900">{src.source_name} — {src.title}</h4>
                  <span className="text-xs text-slate-500 font-mono">{src.url}</span>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200 flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Visit Official Portal
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

