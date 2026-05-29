import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobMatchr | AI-Powered Resume Matching & Discovery",
  description: "Upload your resume and instantly discover matching jobs using AI-powered resume analysis and intelligent job matching. Modern personal career platform for students, freshers, and professionals.",
  keywords: "AI job matching, resume parser, ATS score, resume optimization, career insights, smart jobs, job portal",
  openGraph: {
    title: "JobMatchr | AI-Powered Resume Matching & Discovery",
    description: "Upload your resume and instantly discover matching jobs using AI-powered resume analysis.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

