import Link from "next/link";
import { Compass, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-primary dark:text-blue-400">
              <Compass className="h-5 w-5 text-accent" />
              <span>LawLens AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              An AI-powered civic and legal action engine designed to transform civic confusion into plain-language clarity, source-backed evidence, concrete action plans, and editable draft applications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/analyze" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Problem Analyzer</Link></li>
              <li><Link href="/document" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Document Analyzer</Link></li>
              <li><Link href="/draft" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Draft Generator</Link></li>
              <li><Link href="/history" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Analysis History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">Trust & Disclaimer</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              LawLens provides general civic information and action assistance. It does not provide legal advice or replace qualified professional counsel.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} LawLens AI — Track 3: AI for Civic & Legal Empowerment</p>
          <p>Built for Civic Empowerment</p>
        </div>
      </div>
    </footer>
  );
}
