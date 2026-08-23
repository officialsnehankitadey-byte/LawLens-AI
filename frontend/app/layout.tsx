import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "LawLens AI — From Civic Confusion to Clear Action",
  description: "AI-powered civic and legal action engine translating complex government procedures into structured action plans and editable drafts.",
  keywords: ["legal AI", "civic rights", "RTI", "consumer complaint", "government schemes", "India"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-base-900 text-text-primary antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
