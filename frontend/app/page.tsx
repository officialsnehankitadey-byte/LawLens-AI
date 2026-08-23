import Link from "next/link";
import { ShieldCheck, FileText, BookOpen, ArrowRight, Search, Scale } from "lucide-react";

export default function Home() {
  return (
    <div className="relative">

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-surface-border">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base-900" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-brand/25 bg-brand/8 text-brand text-xs font-semibold tracking-wider uppercase">
            <Scale className="h-3.5 w-3.5" />
            Action Engine for Civic &amp; Legal Empowerment
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1] text-balance mb-6">
            From Civic Confusion<br />
            to <span className="text-brand">Clear Action</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
            LawLens AI translates bureaucratic complexity, government notices, and legal jargon into plain-language rights, structured action plans, document checklists, and editable drafts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/analyze"
              id="hero-cta-primary"
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm"
            >
              <Search className="h-4 w-4" />
              Analyze My Problem
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/document"
              id="hero-cta-secondary"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm"
            >
              <FileText className="h-4 w-4" />
              Upload a Document
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Workflow</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            How LawLens Works
          </h2>
          <p className="mt-3 text-sm text-text-secondary max-w-xl mx-auto">
            A guided pathway from problem description to an executable, ready-to-submit draft.
          </p>
        </div>

        {/* Step flow */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-0">
          {[
            {
              num: "01",
              title: "Describe or Upload",
              desc: "Provide a plain-language problem description or upload an official notice or letter.",
            },
            {
              num: "02",
              title: "Analyze Rights",
              desc: "Matches consumer rights, RTI procedures, or relevant government schemes to your situation.",
            },
            {
              num: "03",
              title: "Action Plan",
              desc: "Receive a step-by-step roadmap with the exact documents required at each stage.",
            },
            {
              num: "04",
              title: "Generate Draft",
              desc: "Produce a ready-to-submit RTI, consumer complaint, or appeal — fully editable.",
            },
          ].map((step, idx, arr) => (
            <div key={step.num} className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 p-5 md:p-6 md:text-center">
              {/* Connector line on desktop */}
              {idx < arr.length - 1 && (
                <div className="hidden md:block absolute top-[2.75rem] left-[calc(50%+1.5rem)] right-0 h-px border-t border-dashed border-surface-borderHover" />
              )}

              {/* Step number */}
              <div className="shrink-0 flex items-center justify-center h-11 w-11 rounded-full border-2 border-brand/40 bg-brand/8 text-brand font-bold text-sm z-10">
                {step.num}
              </div>

              <div className="md:mt-5 space-y-1.5">
                <h3 className="font-semibold text-text-primary text-sm">{step.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CORE WORKFLOWS ────────────────────────────────────────────── */}
      <section className="border-t border-surface-border bg-surface/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Core Supported Civic Workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                iconColor: "text-brand",
                title: "Consumer Complaints",
                desc: "Damaged goods, refund refusals, and e-commerce service deficiency — from filing to resolution.",
              },
              {
                icon: FileText,
                iconColor: "text-brand",
                title: "Right to Information (RTI)",
                desc: "Request public project expenditure, municipal records, and application status under the RTI Act.",
              },
              {
                icon: BookOpen,
                iconColor: "text-brand",
                title: "Government Schemes",
                desc: "Eligibility verification, missing document detection, and application steps for public welfare schemes.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="card-raised p-6 space-y-4 group hover:border-surface-borderHover transition-all duration-200"
                >
                  <div className="h-9 w-9 flex items-center justify-center rounded-md bg-brand/10 border border-brand/20">
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section className="border-t border-surface-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Ready to understand your rights?
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Start with a free-form description of your problem, or upload an official notice to get started.
          </p>
          <Link
            href="/analyze"
            id="bottom-cta"
            className="btn-primary inline-flex px-8 py-3"
          >
            Start Free Analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
