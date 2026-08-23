"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SituationAnalysisResponse, DocumentAnalysisResponse } from "@/lib/types";
import {
  CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck,
  Clock, Calendar, ExternalLink, ChevronLeft, Loader2
} from "lucide-react";

// ─── Utility components ──────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label, iconClass = "text-brand" }: {
  icon: React.ElementType;
  label: string;
  iconClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className={`h-4.5 w-4.5 ${iconClass} shrink-0`} style={{ height: "1.125rem", width: "1.125rem" }} />
      <h2 className="text-base font-semibold text-text-primary tracking-tight">{label}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-surface-border" />;
}

// ─── Document Analysis View ──────────────────────────────────────────────────

function DocumentView({ data }: { data: DocumentAnalysisResponse }) {
  const router = useRouter();

  const isAI = data.provider === "gemini" || data.mode === "ai";
  const displayTitle = data.title || (data.identified_issues && data.identified_issues[0]) || data.filename;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 animate-fade-in">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="btn-ghost -ml-1 text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge-brand uppercase text-[10px] tracking-widest">
            {data.document_type || "Document Analysis"}
          </span>
          {isAI ? (
            <span className="badge-info text-[10px] flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3" /> AI Analysis
            </span>
          ) : (
            <span className="badge-warning text-[10px] flex items-center gap-1 font-medium">
              <AlertTriangle className="h-3 w-3" /> Fallback Mode
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-tight">
            {displayTitle}
          </h1>
          <p className="text-xs text-text-muted font-mono">Source document: {data.filename}</p>
        </div>
        <div className="p-4 rounded-md bg-surface border border-surface-border space-y-1.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Document Summary</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
        </div>
      </div>

      <Divider />

      {/* Document-Derived Facts */}
      {data.extracted_facts && data.extracted_facts.length > 0 && (
        <div>
          <SectionHeading icon={FileText} label="Document-Derived Facts" iconClass="text-brand" />
          <p className="text-xs text-text-muted mb-3">Facts explicitly extracted from the uploaded document:</p>
          <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-surface overflow-hidden">
            {data.extracted_facts.map((fact, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="text-text-primary leading-relaxed">{fact.fact}</span>
                <span className="badge-neutral shrink-0 text-[10px] uppercase">
                  {fact.category === "document_fact" ? "Explicit Fact" : (fact.confidence || "Fact")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates & Deadlines */}
      <div>
        <SectionHeading icon={Clock} label="Important Dates &amp; Deadlines" />
        <div className="grid sm:grid-cols-2 gap-4">
          
          {/* Document Deadline */}
          <div className="p-5 rounded-md bg-warning-muted border border-warning-border space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warning-text" />
              <h3 className="text-sm font-semibold text-warning-text">Document Deadline</h3>
            </div>
            {data.explicit_deadlines && data.explicit_deadlines.length > 0 ? (
              <ul className="space-y-2">
                {data.explicit_deadlines.map((dl, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-warning-text font-medium">
                    <div className="status-dot bg-warning-text" />
                    <span>{dl}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-warning-text italic">Deadline identified in document: None</p>
            )}
          </div>

          {/* Mentioned Dates */}
          <div className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <h3 className="text-sm font-semibold text-text-primary">Mentioned Dates</h3>
            </div>
            {data.explicit_dates && data.explicit_dates.length > 0 ? (
              <ul className="space-y-2">
                {data.explicit_dates.map((dt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                    <div className="status-dot bg-text-muted" />
                    <span>{dt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-text-muted italic">No explicit dates mentioned</p>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents vs Optional Supporting Evidence */}
      <div className="space-y-4">
        {/* Required Documents */}
        <div className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-brand" style={{ height: "1.125rem", width: "1.125rem" }} />
            <h3 className="text-sm font-semibold text-text-primary">Required Documents (Requested in Document)</h3>
          </div>
          <p className="text-xs text-text-muted">Documents explicitly requested in the uploaded document text:</p>
          {data.required_documents && data.required_documents.length > 0 ? (
            <ul className="space-y-2">
              {data.required_documents.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted italic">No specific documents were requested in this document.</p>
          )}
        </div>

        {/* Optional Supporting Evidence */}
        {data.optional_supporting_evidence && data.optional_supporting_evidence.length > 0 && (
          <div className="p-5 rounded-md bg-surface-raised border border-surface-border space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Optional Supporting Evidence</h3>
            <ul className="space-y-2">
              {data.optional_supporting_evidence.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-text-muted">
                  <div className="status-dot bg-text-muted" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Plan */}
      <div>
        <SectionHeading icon={CheckCircle2} label="Action Plan" iconClass="text-success-text" />
        
        {/* Immediate action */}
        {(data.immediate_action || (data.recommended_actions && data.recommended_actions.length > 0)) && (
          <div className="mb-4 p-4 rounded-md bg-success-muted border border-success-border">
            <p className="text-sm text-success-text">
              <span className="font-semibold">Immediate Action (Based on Document): </span>
              {data.immediate_action || data.recommended_actions[0]}
            </p>
          </div>
        )}

        {/* Possible Next Steps */}
        {((data.possible_next_steps && data.possible_next_steps.length > 0) || (data.recommended_actions && data.recommended_actions.length > 1)) && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Possible Next Steps (Optional Guidance)</h3>
            {(data.possible_next_steps && data.possible_next_steps.length > 0
              ? data.possible_next_steps
              : data.recommended_actions.slice(1)
            ).map((act, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-4 rounded-md bg-surface border border-surface-border text-sm text-text-primary">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] shrink-0">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{act}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Potentially Applicable Legal Guidance */}
      {data.potentially_applicable_rights && data.potentially_applicable_rights.length > 0 && (
        <div>
          <SectionHeading icon={ShieldCheck} label="Potentially Applicable Legal Guidance" iconClass="text-info-text" />
          <p className="text-xs text-text-muted mb-3">General guidance retrieved from verified legal sources (distinguished from document facts):</p>
          <div className="space-y-3">
            {data.potentially_applicable_rights.map((item, idx) => (
              <div key={idx} className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug">{item.topic}</h3>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge-info shrink-0 text-[10px] no-underline hover:bg-info/20 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Official Source
                    </a>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.explanation}</p>
                <div className="accent-border-left">
                  <p className="text-xs text-text-muted leading-relaxed">
                    <span className="text-text-secondary font-medium">Why relevant: </span>
                    {item.relevance_reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Legal Sources */}
      {data.verified_sources && data.verified_sources.length > 0 && (
        <div>
          <SectionHeading icon={ExternalLink} label="Verified Legal Citations &amp; Sources" iconClass="text-info-text" />
          <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-surface overflow-hidden">
            {data.verified_sources.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {src.source_name} — {src.title}
                  </p>
                  <p className="text-xs text-text-muted font-mono mt-0.5 truncate">{src.url}</p>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge-info shrink-0 text-[10px] no-underline hover:bg-info/20 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-md bg-surface-raised border border-surface-border">
        <div className="space-y-1">
          <h3 className="font-semibold text-text-primary">Need a formal document response?</h3>
          <p className="text-xs text-text-secondary">Generate an editable draft or complaint based on this document analysis.</p>
        </div>
        <button
          onClick={() => router.push(`/draft?type=${data.recommended_draft_type || "consumer_complaint"}&summary=${encodeURIComponent(data.summary)}`)}
          id="doc-generate-draft"
          className="btn-primary shrink-0 text-sm"
        >
          <FileText className="h-4 w-4" />
          Generate Draft
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Situation Analysis View ─────────────────────────────────────────────────

function SituationView({ data }: { data: SituationAnalysisResponse }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 animate-fade-in">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="btn-ghost -ml-1 text-xs"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge-brand uppercase text-[10px] tracking-widest">
            {data.category} Analysis
          </span>
          {data.is_demo && (
            <span className="badge-warning text-[10px]">Demo / Fallback</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-tight">
          {data.detected_issue}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{data.situation_summary}</p>
      </div>

      <Divider />

      {/* Applicable Rights / Schemes */}
      <div>
        <SectionHeading icon={ShieldCheck} label="Potentially Applicable Rights &amp; Schemes" />
        <div className="space-y-3">
          {data.applicable_rights_or_schemes.map((item, idx) => (
            <div key={idx} className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-text-primary text-sm leading-snug">{item.topic}</h3>
                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge-info shrink-0 text-[10px] no-underline hover:bg-info/20 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Official Source
                  </a>
                )}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{item.explanation}</p>
              <div className="accent-border-left">
                <p className="text-xs text-text-muted leading-relaxed">
                  <span className="text-text-secondary font-medium">Why relevant: </span>
                  {item.relevance_reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Sources */}
      {data.sources && data.sources.length > 0 && (
        <div>
          <SectionHeading icon={ExternalLink} label="Verified Legal Citations &amp; Sources" iconClass="text-info-text" />
          <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-surface overflow-hidden">
            {data.sources.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {src.source_name} — {src.title}
                  </p>
                  <p className="text-xs text-text-muted font-mono mt-0.5 truncate">{src.url}</p>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge-info shrink-0 text-[10px] no-underline hover:bg-info/20 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div>
        <SectionHeading icon={CheckCircle2} label="Step-by-Step Action Plan" iconClass="text-success-text" />

        {/* Immediate action */}
        <div className="mb-4 p-4 rounded-md bg-success-muted border border-success-border">
          <p className="text-sm text-success-text">
            <span className="font-semibold">Immediate Action: </span>
            {data.action_plan.immediate_action}
          </p>
        </div>

        {/* Ordered steps */}
        <div className="space-y-3">
          {data.action_plan.ordered_steps.map((step) => (
            <div key={step.step_number} className="flex items-start gap-4 p-5 rounded-md bg-surface border border-surface-border">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold text-xs shrink-0">
                {step.step_number}
              </div>
              <div className="space-y-1.5 min-w-0">
                <h3 className="font-semibold text-text-primary text-sm">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                <p className="text-xs text-text-muted">
                  <span className="font-medium text-text-secondary">Why it matters: </span>
                  {step.why_it_matters}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Documents */}
      <div className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold text-text-primary">Required Documents Checklist</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {data.action_plan.required_documents.map((doc, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-sm text-text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-md bg-surface-raised border border-surface-border">
        <div className="space-y-1">
          <h3 className="font-semibold text-text-primary">Ready to take action?</h3>
          <p className="text-xs text-text-secondary">Generate an editable draft application or complaint customized for your situation.</p>
        </div>
        <button
          onClick={() => router.push(`/draft?type=${data.recommended_draft_type || "consumer_complaint"}&summary=${encodeURIComponent(data.situation_summary)}`)}
          id="situation-generate-draft"
          className="btn-primary shrink-0 text-sm"
        >
          <FileText className="h-4 w-4" />
          Generate Draft
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Disclaimer */}
      {data.disclaimer && (
        <p className="text-xs text-text-muted text-center italic px-6">{data.disclaimer}</p>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SituationAnalysisResponse | DocumentAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-brand animate-spin mx-auto" />
          <p className="text-sm text-text-secondary">Loading analysis…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center space-y-5">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-surface border border-surface-border mx-auto">
          <FileText className="h-6 w-6 text-text-muted" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text-primary">Analysis Not Found</h2>
          <p className="text-sm text-text-secondary">The requested analysis result could not be found in local storage.</p>
        </div>
        <button
          onClick={() => router.push("/analyze")}
          id="not-found-cta"
          className="btn-primary mx-auto"
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
    return <DocumentView data={data} />;
  }

  return <SituationView data={data} />;
}
