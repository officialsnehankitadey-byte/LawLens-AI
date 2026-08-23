import { ShieldCheck, FileText, Scale } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 space-y-12">

      {/* Hero */}
      <div className="space-y-4">
        <p className="section-label">About</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight leading-tight">
          Civic Empowerment<br />
          <span className="text-brand">Action Engine</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
          LawLens AI was created to bridge the usability gap between complex government portals, legal texts, PDF notices, and citizen action.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Mission */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Scale className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">Mission &amp; Positioning</h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Unlike generic chatbot systems that output paragraphs of unverified legal advice, LawLens is an{" "}
          <strong className="text-text-primary font-semibold">action engine</strong>. It ingests citizen problem descriptions or official notices, validates facts, searches verified civic rights and schemes, structures an ordered step-by-step action plan, compiles an evidence checklist, and generates editable draft applications — RTI, Consumer Complaints, and Appeals.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
          <div className="flex items-center justify-center h-9 w-9 rounded bg-brand/10 border border-brand/20">
            <ShieldCheck className="h-5 w-5 text-brand" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-text-primary text-sm">Source Grounding &amp; Safety</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              LawLens clearly separates AI interpretation from verified source information. It does not fabricate legal sections, schemes, or fake government links.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-md bg-surface border border-surface-border space-y-3">
          <div className="flex items-center justify-center h-9 w-9 rounded bg-brand/10 border border-brand/20">
            <FileText className="h-5 w-5 text-brand" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-text-primary text-sm">Privacy-First Architecture</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              All user inputs and uploaded documents are processed in-memory for the MVP. Personal analysis history is stored strictly in your local browser storage — never on a server.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-5 rounded-md bg-surface-raised border border-surface-border space-y-2">
        <h4 className="section-label">Legal Disclaimer</h4>
        <p className="text-xs text-text-muted leading-relaxed">
          LawLens AI provides general civic information, scheme matching, and document-drafting assistance for educational and empowerment purposes. It does not provide formal legal advice, guarantee application acceptance, or create an attorney-client relationship. Please verify critical submissions with official departmental portals or qualified legal advisors.
        </p>
      </div>

    </div>
  );
}
