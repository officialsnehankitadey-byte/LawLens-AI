"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SituationAnalysisResponse, DocumentAnalysisResponse, SuggestedLawyer, ActionStep } from "@/lib/types";
import { getSuggestedLawyers } from "@/lib/api";
import {
  CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck,
  Clock, Calendar, ExternalLink, ChevronLeft, Loader2, Scale,
  MapPin, Phone, Mail, Award, Sparkles, Building2, UserCheck, Star,
  ShieldAlert, Lightbulb, HeartHandshake, AlertCircle, HelpCircle, Send
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
      <h2 className="text-base font-bold text-text-primary tracking-tight">{label}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-surface-border" />;
}

// ─── Action Type Icon & Badge Helper ──────────────────────────────────────────

function getActionTypeDetails(type?: string) {
  switch (type) {
    case "call_helpline":
      return {
        icon: Phone,
        badgeText: "Helpline Action",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        color: "text-emerald-500",
      };
    case "go_to_police":
      return {
        icon: ShieldAlert,
        badgeText: "Police Station Step",
        badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        color: "text-rose-500",
      };
    case "contact_lawyer":
      return {
        icon: Scale,
        badgeText: "Consult Lawyer",
        badgeClass: "bg-brand/10 text-brand border-brand/20",
        color: "text-brand",
      };
    case "online_portal":
      return {
        icon: ExternalLink,
        badgeText: "Online Portal Filing",
        badgeClass: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        color: "text-sky-500",
      };
    case "send_notice":
      return {
        icon: Send,
        badgeText: "Send Written Notice",
        badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        color: "text-amber-500",
      };
    case "gather_documents":
    default:
      return {
        icon: FileText,
        badgeText: "Document Collection",
        badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        color: "text-indigo-500",
      };
  }
}

// ─── Top 5 Verified Real Lawyers Component ───────────────────────────────────

function SuggestedLawyersSection({
  initialLawyers,
  category,
  initialLocation,
}: {
  initialLawyers?: SuggestedLawyer[];
  category: string;
  initialLocation?: string;
}) {
  const [lawyers, setLawyers] = useState<SuggestedLawyer[]>(initialLawyers || []);
  const [locationQuery, setLocationQuery] = useState(initialLocation || "");
  const [loading, setLoading] = useState(false);

  const handleLocationSearch = async (locToSearch: string) => {
    setLoading(true);
    try {
      const res = await getSuggestedLawyers(category, locToSearch);
      if (res && res.lawyers) {
        setLawyers(res.lawyers);
      }
    } catch (err) {
      console.error("Failed to fetch lawyers for location:", err);
    } finally {
      setLoading(false);
    }
  };

  const cities = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune"];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="h-4.5 w-4.5 text-brand" />
            <h2 className="text-base font-bold text-text-primary tracking-tight">
              Recommended Top 5 Real Advocates in India
            </h2>
            <span className="badge-brand text-[10px] uppercase font-bold tracking-wider">
              Real Practicing Bar Counsels
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Verified advocates and Senior Counsels enrolled with State Bar Councils ready to represent your matter.
          </p>
        </div>

        {/* Location filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px]">
            <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLocationSearch(locationQuery);
              }}
              placeholder="Filter by city..."
              className="input-base text-xs pl-8 pr-3 py-1.5 w-full rounded-md border border-surface-border bg-surface text-text-primary"
            />
          </div>
          <button
            onClick={() => handleLocationSearch(locationQuery)}
            disabled={loading}
            className="btn-secondary text-xs px-3 py-1.5 shrink-0"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Filter"}
          </button>
        </div>
      </div>

      {/* Quick city tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-text-muted mr-1">Switch City:</span>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => {
              setLocationQuery(city);
              handleLocationSearch(city);
            }}
            className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all ${
              locationQuery.toLowerCase() === city.toLowerCase()
                ? "bg-brand text-white border-brand font-medium"
                : "bg-surface-raised border-surface-border text-text-muted hover:text-text-primary hover:border-brand/40"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Lawyers Cards List */}
      <div className="space-y-4">
        {lawyers && lawyers.length > 0 ? (
          lawyers.map((lawyer, idx) => (
            <div
              key={lawyer.id || idx}
              className="p-5 rounded-lg bg-surface border border-surface-border hover:border-brand/40 transition-all space-y-4 shadow-sm"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-text-primary text-base">
                      {lawyer.name}
                    </h3>
                    <span className="badge-brand text-[10px] font-semibold">
                      {lawyer.title}
                    </span>
                    {lawyer.verified_practitioner && (
                      <span className="badge-info text-[10px] flex items-center gap-1 font-medium">
                        <UserCheck className="h-3 w-3" /> Verified Bar Practitioner
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-brand">
                    {lawyer.specialization}
                  </p>
                </div>

                {/* Rating & Exp badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>{lawyer.rating.toFixed(1)}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-surface-raised border border-surface-border text-text-secondary text-xs font-medium">
                    {lawyer.experience_years}+ Yrs Exp
                  </div>
                </div>
              </div>

              {/* Court & Bar Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-secondary pt-1 border-t border-surface-border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="truncate">
                    <strong className="text-text-primary">Jurisdiction: </strong>
                    {lawyer.court_practice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span>
                    <strong className="text-text-primary">Location: </strong>
                    {lawyer.location}
                  </span>
                </div>
                {lawyer.bar_council_reg && (
                  <div className="flex items-center gap-2 sm:col-span-2 text-text-muted">
                    <Award className="h-3.5 w-3.5 text-brand shrink-0" />
                    <span>
                      <strong className="text-text-secondary">Bar Council Enrollment: </strong>
                      {lawyer.bar_council_reg}
                    </span>
                  </div>
                )}
              </div>

              {/* Notable work / Bio */}
              {lawyer.notable_work_or_bio && (
                <p className="text-xs text-text-muted leading-relaxed bg-surface-raised/60 p-3 rounded border border-surface-border/50 italic">
                  &ldquo;{lawyer.notable_work_or_bio}&rdquo;
                </p>
              )}

              {/* Chambers Address & Action row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-text-muted truncate max-w-md">
                  <span className="font-medium text-text-secondary">Chambers: </span>
                  {lawyer.chambers_address}
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {lawyer.contact_phone && (
                    <a
                      href={`tel:${lawyer.contact_phone.replace(/\s+/g, "")}`}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                    >
                      <Phone className="h-3 w-3 text-brand" />
                      Call Chambers
                    </a>
                  )}
                  {lawyer.consultation_url && (
                    <a
                      href={lawyer.consultation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Connect / Registry
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 rounded-lg bg-surface border border-surface-border text-center text-xs text-text-muted">
            No specific advocates found for this query. Use the location filter above to search by city.
          </div>
        )}
      </div>
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

      {/* Suggested 5 Real Lawyers for Document */}
      <Divider />
      <SuggestedLawyersSection
        initialLawyers={data.suggested_lawyers}
        category="consumer"
      />

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
  const categoryDisplayName = data.predicted_category_name || (data.category ? data.category.replace("_", " ").toUpperCase() : "Civic / Legal");

  const isHighUrgency = data.urgency_level === "high_urgency";
  const isModerate = data.urgency_level === "moderate";

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

      {/* ─── 1. EMOTIONAL REASSURANCE & PEACE OF MIND BANNER ────────────────── */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-surface to-surface-raised border border-surface-border shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="h-3.5 w-3.5" />
              Citizen Peace of Mind &amp; Protection
            </span>
          </div>

          {/* Urgency Badge */}
          {isHighUrgency ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              High Urgency (Act Within 24-48 Hours)
            </span>
          ) : isModerate ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
              <Clock className="h-3.5 w-3.5" />
              Moderate Priority (7-14 Days)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-500 text-xs font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Standard Process
            </span>
          )}
        </div>

        {/* Reassurance Message */}
        <div className="space-y-2">
          <p className="text-base sm:text-lg font-medium text-text-primary leading-relaxed">
            {data.reassurance_message || "You have clear rights under Indian law. Do not panic — follow the simple practical steps below to protect yourself."}
          </p>
          {data.urgency_reason && (
            <p className="text-xs text-text-secondary leading-relaxed bg-surface-raised/80 p-2.5 rounded border border-surface-border/60">
              <strong className="text-text-primary">Why this matters right now: </strong>
              {data.urgency_reason}
            </p>
          )}
        </div>
      </div>

      {/* ─── 2. AI CATEGORY PREDICTION BANNER ──────────────────────────────── */}
      <div className="p-5 rounded-xl bg-surface border border-surface-border shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              AI Predicted Domain
            </span>
            <span className="badge-info text-xs font-semibold">
              {data.category_confidence ? `${data.category_confidence.toUpperCase()} CONFIDENCE` : "PREDICTED"}
            </span>
          </div>

          {data.is_demo && (
            <span className="badge-warning text-[10px]">Deterministic Mode</span>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-snug">
            {categoryDisplayName}
          </h1>
          <p className="text-sm font-semibold text-brand">
            Issue Detected: {data.detected_issue}
          </p>
        </div>

        {data.category_reasoning && (
          <div className="p-3 rounded-lg bg-surface-raised border border-surface-border text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Why AI chose this category: </strong>
            {data.category_reasoning}
          </div>
        )}

        <p className="text-sm text-text-secondary leading-relaxed">
          {data.situation_summary}
        </p>
      </div>

      <Divider />

      {/* ─── 3. SIMPLIFIED STEP-BY-STEP HUMAN-READABLE ACTION PLAN ─────────── */}
      <div className="space-y-6">
        <div>
          <SectionHeading icon={CheckCircle2} label="Step-by-Step Practical Solutions &amp; Action Plan" iconClass="text-success-text" />
          <p className="text-xs text-text-secondary -mt-3 mb-4">
            Follow this clear, plain-language roadmap. Each step tells you exactly what to do, who to approach, and how to protect yourself.
          </p>
        </div>

        {/* Immediate Priority Action */}
        {data.action_plan?.immediate_action && (
          <div className="p-5 rounded-xl bg-success-muted border border-success-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success-text shrink-0" />
              <h3 className="text-xs font-bold text-success-text uppercase tracking-wider">
                Immediate First Step (Do This First)
              </h3>
            </div>
            <p className="text-sm sm:text-base font-semibold text-success-text leading-relaxed">
              {data.action_plan.immediate_action}
            </p>
          </div>
        )}

        {/* Action Steps Cards */}
        <div className="space-y-4">
          {data.action_plan?.ordered_steps?.map((step: ActionStep) => {
            const actionMeta = getActionTypeDetails(step.action_type);
            const ActionIcon = actionMeta.icon;

            return (
              <div
                key={step.step_number}
                className="p-5 sm:p-6 rounded-xl bg-surface border border-surface-border shadow-sm hover:border-brand/30 transition-all space-y-4"
              >
                {/* Step Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand/10 border border-brand/20 text-brand font-bold text-sm shrink-0">
                      {step.step_number}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-base">
                        {step.title}
                      </h3>
                      {step.simple_summary && (
                        <p className="text-xs text-brand font-medium">
                          👉 {step.simple_summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Type Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${actionMeta.badgeClass} self-start sm:self-auto shrink-0`}>
                    <ActionIcon className="h-3.5 w-3.5" />
                    {actionMeta.badgeText}
                  </span>
                </div>

                {/* Plain-language explanation */}
                <div className="text-sm text-text-secondary leading-relaxed pl-0 sm:pl-11 space-y-3">
                  <p>{step.description}</p>

                  {/* Why it matters */}
                  {step.why_it_matters && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      <strong className="text-text-secondary">Why this protects you: </strong>
                      {step.why_it_matters}
                    </p>
                  )}

                  {/* Practical Insider Tip */}
                  {step.practical_tip && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-text-secondary text-xs">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-500 font-bold">Pro Tip for Citizens: </strong>
                        <span>{step.practical_tip}</span>
                      </div>
                    </div>
                  )}

                  {/* Authority / Submission method */}
                  {step.authority && (
                    <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                      <Building2 className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span>
                        <strong className="text-text-secondary">Approaching Authority / Forum: </strong>
                        <span className="text-brand font-medium">{step.authority}</span>
                        {step.submission_method ? ` via ${step.submission_method}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Documents needed for this specific step */}
                  {step.required_documents && step.required_documents.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                      <span className="text-text-muted font-medium">Keep Ready:</span>
                      {step.required_documents.map((doc, dIdx) => (
                        <span key={dIdx} className="px-2 py-0.5 rounded bg-surface-raised border border-surface-border text-text-secondary text-[11px]">
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required Documents Checklist */}
      {data.action_plan?.required_documents && data.action_plan.required_documents.length > 0 && (
        <div className="p-5 rounded-lg bg-surface border border-surface-border space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-bold text-text-primary">Master Evidence &amp; Documents Checklist</h3>
          </div>
          <p className="text-xs text-text-muted">
            Have photocopies and clear digital PDF copies of these documents ready before proceeding:
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
            {data.action_plan.required_documents.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── 4. 5 REAL LAWYERS COMPONENT ──────────────────────────────────── */}
      <Divider />
      <SuggestedLawyersSection
        initialLawyers={data.suggested_lawyers}
        category={data.predicted_category || data.category}
      />

      <Divider />

      {/* ─── 5. APPLICABLE LEGAL RIGHTS IN SIMPLE TERMS ────────────────────── */}
      {data.applicable_rights_or_schemes && data.applicable_rights_or_schemes.length > 0 && (
        <div>
          <SectionHeading icon={ShieldCheck} label="Your Legal Protections &amp; Statutory Framework" />
          <div className="space-y-3">
            {data.applicable_rights_or_schemes.map((item, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-surface border border-surface-border space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-text-primary text-sm leading-snug">{item.topic}</h3>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge-info shrink-0 text-[10px] no-underline hover:bg-info/20 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Official Portal
                    </a>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.explanation}</p>
                <div className="accent-border-left">
                  <p className="text-xs text-text-muted leading-relaxed">
                    <span className="text-text-secondary font-medium">How it helps you: </span>
                    {item.relevance_reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-lg bg-surface-raised border border-surface-border shadow-sm">
        <div className="space-y-1">
          <h3 className="font-bold text-text-primary">Ready to draft your legal notice or complaint?</h3>
          <p className="text-xs text-text-secondary">Generate an editable formal complaint or representation tailored to this analysis.</p>
        </div>
        <button
          onClick={() => router.push(`/draft?type=${data.recommended_draft_type || "consumer_complaint"}&summary=${encodeURIComponent(data.situation_summary)}`)}
          id="situation-generate-draft"
          className="btn-primary shrink-0 text-sm py-2.5 px-4"
        >
          <FileText className="h-4 w-4" />
          Generate Editable Draft
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
