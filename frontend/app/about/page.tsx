import { ShieldCheck, Compass, FileText, CheckCircle2, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          <Info className="h-3.5 w-3.5" />
          About LawLens AI
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Civic Empowerment Action Engine</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          LawLens AI was created to bridge the usability gap between complex government portals, legal texts, PDF notices, and citizen action.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent" />
          Our Mission & Positioning
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Unlike generic chatbot systems that output paragraphs of unverified legal advice, LawLens is an **action engine**. It ingests citizen problem descriptions or official notices, validates facts, searches verified civic rights/schemes, structures an ordered step-by-step action plan, compiles an evidence checklist, and generates editable draft applications (RTI, Consumer Complaints, Appeals).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h3 className="font-semibold text-slate-900 text-base">Source Grounding & Safety</h3>
          <p className="text-sm text-slate-500">
            LawLens clearly separates AI interpretation from verified source information. It does not fabricate legal sections, schemes, or fake government links.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <FileText className="h-7 w-7 text-accent" />
          <h3 className="font-semibold text-slate-900 text-base">Privacy First Architecture</h3>
          <p className="text-sm text-slate-500">
            All user inputs and uploaded documents for the MVP are processed in-memory. Personal analysis history is stored strictly in your local browser storage.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Legal Disclaimer</h4>
        <p className="leading-relaxed text-slate-600">
          LawLens AI provides general civic information, scheme matching, and document-drafting assistance for educational and empowerment purposes. It does not provide formal legal advice, guarantee application acceptance, or create a attorney-client relationship. Please verify critical submissions with official departmental portals or qualified legal advisors.
        </p>
      </div>
    </div>
  );
}
