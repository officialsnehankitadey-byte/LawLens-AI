"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SituationAnalysisResponse, DocumentAnalysisResponse } from "@/lib/types";
import {
  CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck,
  Clock, Calendar, ExternalLink, ChevronLeft, Loader2, ChevronDown, ChevronUp,
  Cpu, Info
} from "lucide-react";

// ─── Utility components ──────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label, iconClass = "text-brand" }: {
  icon: React.ElementType;
  label: string;
  iconClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className={`h-[1.125rem] w-[1.125rem] ${iconClass} shrink-0`} />
      <h2 className="text-base font-semibold text-text-primary tracking-tight">{label}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-surface-border" />;
}

function ModeBadge({ isDemo }: { isDemo: boolean }) {
  if (isDemo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide bg-warning-muted text-warning-text border border-warning-border">
        <Info className="h-3 w-3" />
        DEMO / FALLBACK MODE — No API key active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide bg-success-muted text-success-text border border-success-border">
      <Cpu className="h-3 w-3" />
      REAL AI MODE — Powered by Gemini
    </span>
  );
}

// ─── Collapsible Required Documents ────────────────────────────────────────

function CollapsibleDocumentChecklist({ documents }: { documents: string[] }) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<boolean[]>(documents.map(() => false));

  const toggle = (idx: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className="rounded-md bg-surface border border-surface-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-raised transition-colors duration-100 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-semibold text-text-primary">Required Documents Checklist</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-muted text-brand font-medium">
            {documents.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-surface-border">
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
            {documents.map((doc, idx) => (
              <li
                key={idx}
                onClick={() => toggle(idx)}
                className="flex items-center gap-2.5 text-sm cursor-pointer group"
              >
                <div className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-all duration-100 ${
                  checked[idx]
                    ? "bg-brand border-brand"
                    : "border-surface-borderHover group-hover:border-brand"
                }`}>
                  {checked[idx] && (
                    <svg className="h-2.5 w-2.5 text-text-inverse" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`leading-relaxed transition-colors duration-100 ${
                  checked[idx] ? "line-through text-text-muted" : "text-text-secondary group-hover:text-text-primary"
                }`}>
                  {doc}
                </span>
              </li>
            ))}
          </ul>
          {documents.length === 0 && (
            <p className="text-sm text-text-muted italic mt-3">No specific documents listed for this analysis.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Document Analysis View ──────────────────────────────────────────────────

function DocumentView({ data }: { data: DocumentAnalysisResponse }) {
  const router = useRouter();

  const isAI = data.provider === "gemini" || data.mode === "ai";
  const displayTitle = data.title || (data.identified_issues && data.identified_issues[0]) || data.filename;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 space-y-10 animate-fade-in">

      {/* Back */}
      <button onClick={() => router.back()} className="btn-ghost -ml-1 text-xs">
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge-brand uppercase text-[10px] tracking-widest">
            {data.document_type || "Document Analysis"}
          </span>
          <ModeBadge isDemo={!isAI} />
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
        <SectionHeading icon={Clock} label="Important Dates & Deadlines" />
        <div className="grid sm:grid-cols-2 gap-4">
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
              <p className="text-xs text-warning-text italic">No explicit deadline found in document</p>
            )}
          </div>

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

      {/* Required Documents */}
      <CollapsibleDocumentChecklist documents={data.required_documents || []} />

      {/* Action Plan */}
      <div>
        <SectionHeading icon={CheckCircle2} label="Action Plan" iconClass="text-success-text" />

        {(data.immediate_action || (data.recommended_actions && data.recommended_actions.length > 0)) && (
          <div className="mb-4 p-4 rounded-md bg-success-muted border border-success-border">
            <p className="text-sm text-success-text">
              <span className="font-semibold">Immediate Action: </span>
              {data.immediate_action || data.recommended_actions[0]}
            </p>
          </div>
        )}

        {((data.possible_next_steps && data.possible_next_steps.length > 0) || (data.recommended_actions && data.recommended_actions.length > 1)) && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Next Steps</h3>
            {(data.possible_next_steps && data.possible_next_steps.length > 0
              ? data.possible_next_steps
              : data.recommended_actions.slice(1)
            ).map((act, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-4 rounded-md bg-surface border border-surface-border text-sm text-text-primary">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-muted border border-brand text-brand font-bold text-[10px] shrink-0">
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
          <p className="text-xs text-text-muted mb-3">General guidance from verified legal sources:</p>
          <div className="space-y-3">
            {data.potentially_applicable_rights.map((item, idx) => (
              <div key={idx} className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug">{item.topic}</h3>
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                      className="badge-info shrink-0 text-[10px] no-underline hover:brightness-110 transition-all">
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

      {/* Verified Sources */}
      {data.verified_sources && data.verified_sources.length > 0 && (
        <div>
          <SectionHeading icon={ExternalLink} label="Verified Legal Citations & Sources" iconClass="text-info-text" />
          <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-surface overflow-hidden">
            {data.verified_sources.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{src.source_name} — {src.title}</p>
                  <p className="text-xs text-text-muted font-mono mt-0.5 truncate">{src.url}</p>
                </div>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="badge-info shrink-0 text-[10px] no-underline hover:brightness-110 transition-all">
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
      <button onClick={() => router.back()} className="btn-ghost -ml-1 text-xs">
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge-brand uppercase text-[10px] tracking-widest">
            {data.category} Analysis
          </span>
          <ModeBadge isDemo={data.is_demo} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-tight">
          {data.detected_issue}
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{data.situation_summary}</p>
      </div>

      <Divider />

      {/* Applicable Rights / Schemes */}
      <div>
        <SectionHeading icon={ShieldCheck} label="Potentially Applicable Rights & Schemes" />
        {data.applicable_rights_or_schemes.length > 0 ? (
          <div className="space-y-3">
            {data.applicable_rights_or_schemes.map((item, idx) => (
              <div key={idx} className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug">{item.topic}</h3>
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                      className="badge-info shrink-0 text-[10px] no-underline hover:brightness-110 transition-all">
                      <ExternalLink className="h-3 w-3" />
                      Official Source
                    </a>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.explanation}</p>
                {item.authority && (
                  <p className="text-xs text-text-muted">
                    <span className="font-medium text-text-secondary">Authority: </span>{item.authority}
                  </p>
                )}
                <div className="accent-border-left">
                  <p className="text-xs text-text-muted leading-relaxed">
                    <span className="text-text-secondary font-medium">Why relevant: </span>
                    {item.relevance_reason}
                  </p>
                </div>
                {item.action_recommended && (
                  <div className="flex items-start gap-2 pt-1">
                    <ArrowRight className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                    <p className="text-xs text-brand font-medium">{item.action_recommended}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-md bg-surface border border-surface-border text-center">
            <AlertTriangle className="h-6 w-6 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No specific rights or schemes could be determined from the information provided.</p>
            <p className="text-xs text-text-muted mt-1">Try providing more specific details about your situation.</p>
          </div>
        )}
      </div>

      {/* Verified Sources */}
      {data.sources && data.sources.length > 0 && (
        <div>
          <SectionHeading icon={ExternalLink} label="Verified Legal Citations & Sources" iconClass="text-info-text" />
          <div className="divide-y divide-surface-border rounded-md border border-surface-border bg-surface overflow-hidden">
            {data.sources.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{src.source_name} — {src.title}</p>
                  <p className="text-xs text-text-muted font-mono mt-0.5 truncate">{src.url}</p>
                </div>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="badge-info shrink-0 text-[10px] no-underline hover:brightness-110 transition-all">
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

        {/* Target authority & timeline */}
        {(data.action_plan.target_authority || data.action_plan.expected_timeline) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {data.action_plan.target_authority && (
              <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-surface-raised border border-surface-border text-text-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-brand shrink-0" />
                <span><span className="font-medium text-text-primary">Authority: </span>{data.action_plan.target_authority}</span>
              </div>
            )}
            {data.action_plan.expected_timeline && (
              <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-surface-raised border border-surface-border text-text-secondary">
                <Clock className="h-3.5 w-3.5 text-brand shrink-0" />
                <span><span className="font-medium text-text-primary">Timeline: </span>{data.action_plan.expected_timeline}</span>
              </div>
            )}
          </div>
        )}

        {/* Ordered steps */}
        {data.action_plan.ordered_steps.length > 0 ? (
          <div className="space-y-3">
            {data.action_plan.ordered_steps.map((step) => (
              <div key={step.step_number} className="flex items-start gap-4 p-5 rounded-md bg-surface border border-surface-border">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-brand-muted border border-brand text-brand font-bold text-xs shrink-0">
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
        ) : (
          <p className="text-sm text-text-muted italic">No detailed steps were generated. Provide more specific problem details for a full action plan.</p>
        )}

        {/* Warnings */}
        {data.action_plan.warnings && data.action_plan.warnings.length > 0 && (
          <div className="mt-4 p-4 rounded-md bg-warning-muted border border-warning-border">
            {data.action_plan.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-warning-text">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Required Documents (collapsible) */}
      <CollapsibleDocumentChecklist documents={data.action_plan.required_documents} />

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
          console.error("[LawLens] Failed to parse stored analysis");
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
          <p className="text-sm text-text-secondary">
            The requested analysis result could not be found. It may have expired from local storage.
          </p>
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
