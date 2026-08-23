import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-[#0A0A0A] py-10">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 select-none w-fit">
              <div className="flex items-center justify-center h-7 w-7 rounded bg-brand shrink-0">
                <Scale className="h-4 w-4 text-base-950" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base text-text-primary tracking-tight">
                LawLens <span className="text-brand">AI</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              An AI-powered civic and legal action engine. Transforms complex government procedures and notices into plain-language rights, structured action plans, and editable draft applications.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="section-label mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/analyze",  label: "Problem Analyzer" },
                { href: "/document", label: "Document Analyzer" },
                { href: "/draft",    label: "Draft Generator" },
                { href: "/history",  label: "Analysis History" },
                { href: "/about",    label: "About" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="section-label mb-4">Disclaimer</h4>
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                LawLens provides general civic information and action assistance. It does not provide legal advice or replace qualified professional counsel.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} LawLens AI — Track 3: AI for Civic &amp; Legal Empowerment</p>
          <p className="text-text-muted">Built for Civic Empowerment</p>
        </div>
      </div>
    </footer>
  );
}
