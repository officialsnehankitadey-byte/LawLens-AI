import Link from "next/link";
import { ShieldCheck, FileText, CheckCircle2, ArrowRight, BookOpen, Compass, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
          <Compass className="h-4 w-4 text-accent" />
          <span>Action Engine for Civic & Legal Empowerment</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          From Civic Confusion to <span className="text-primary">Clear Action</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          LawLens AI translates bureaucratic complexity, notices, and legal jargon into plain-language rights, structured action plans, document checklists, and editable drafts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-medium shadow-md hover:bg-primary-hover transition-all text-base"
          >
            <Search className="h-5 w-5" />
            Analyze My Problem
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/document"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-slate-700 font-medium border border-slate-300 shadow-sm hover:bg-slate-50 transition-all text-base"
          >
            <FileText className="h-5 w-5 text-accent" />
            Upload Document / Notice
          </Link>
        </div>
      </section>

      {/* Action Architecture Core Flow */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">How LawLens Works</h2>
            <p className="text-sm text-slate-500">A guided pathway from problem description to executable draft</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-semibold text-slate-800 text-sm">Describe / Upload</h3>
              <p className="text-xs text-slate-500">Provide plain-language problem or upload official notice/letter.</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="font-semibold text-slate-800 text-sm">Analyze Rights & Evidence</h3>
              <p className="text-xs text-slate-500">Matches consumer rights, RTI procedures, or government schemes.</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="font-semibold text-slate-800 text-sm">Action Plan & Checklist</h3>
              <p className="text-xs text-slate-500">Receive step-by-step roadmap with exact required documents.</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm">4</div>
              <h3 className="font-semibold text-slate-800 text-sm">Generate Editable Draft</h3>
              <p className="text-xs text-slate-500">Produce ready-to-submit RTI, complaint, or appeal application.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Scenarios */}
      <section className="container mx-auto px-4 max-w-5xl space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Core Supported Civic Workflows</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-base text-slate-900">Consumer Complaints</h3>
            <p className="text-sm text-slate-500">Damaged goods, refund refusals, and e-commerce service deficiency resolution.</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <BookOpen className="h-8 w-8 text-accent" />
            <h3 className="font-semibold text-base text-slate-900">Right to Information (RTI)</h3>
            <p className="text-sm text-slate-500">Request public project expenditure, municipal records, and application status.</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <h3 className="font-semibold text-base text-slate-900">Government Schemes</h3>
            <p className="text-sm text-slate-500">Eligibility verification, missing documents detection, and application steps.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
