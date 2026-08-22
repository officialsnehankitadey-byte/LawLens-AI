import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "LawLens AI — From Civic Confusion to Clear Action",
  description: "AI-powered civic and legal action engine translating complex government procedures into structured action plans and editable drafts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
