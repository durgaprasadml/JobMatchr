"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart2, Star, Check, HelpCircle, Briefcase, Lock } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Read auth state from local storage if any
    const email = localStorage.getItem("userEmail");
    const premium = localStorage.getItem("isPremium") === "true";
    if (email) {
      setUserEmail(email);
      setIsPremium(premium);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isPremium");
    setUserEmail(null);
    setIsPremium(false);
  };

  const testimonials = [
    {
      quote: "JobMatchr completely changed how I look for jobs. Within seconds of uploading my resume, I matched with a role at Vercel that I wouldn't have found otherwise.",
      author: "Alex Rivers",
      role: "Frontend Developer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80"
    },
    {
      quote: "The ATS score analyzer highlighted exactly why I was getting rejected by automated systems. Fixed the missing skills and got an interview the next week!",
      author: "Sarah Jenkins",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
    },
    {
      quote: "As a fresh graduate, I didn't know which roles fit my project stack. The AI matched me with the perfect junior roles and explained exactly why. Worth every penny.",
      author: "Daniel Chen",
      role: "CS Graduate",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute top-[800px] right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-accent-secondary/5 blur-[120px] pointer-events-none opacity-30" />

      {/* Nav */}
      <Navbar
        userEmail={userEmail}
        isPremium={isPremium}
        onOpenAuth={() => {
          // Redirect to dashboard where auth is handled or trigger redirect
          window.location.href = "/dashboard?auth=true";
        }}
        onLogout={handleLogout}
        sessionId={null}
        onRescan={() => {}}
      />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg border border-card-border px-3.5 py-1 text-xs font-bold text-muted mb-6 shadow-sm hover:border-accent/30 transition-all duration-300">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>Introducing JobMatchr 1.0 — Powered by Gemini AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent leading-[1.1] max-w-2xl">
            Upload your resume and discover jobs that{" "}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              actually match
            </span>{" "}
            your skills.
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted leading-relaxed font-semibold">
            AI-powered personalized job matching for students, freshers, and professionals. 
            Instantly benchmark your resume against live roles and see your ATS compatibility.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Link
              href="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-accent/25 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            >
              <span>Upload Resume</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-card-border bg-card/60 px-8 py-4 text-sm font-bold hover:bg-card-border transition-all duration-200"
            >
              Learn How it Works
            </Link>
          </div>

          {/* Privacy text */}
          <p className="mt-4 text-xs text-muted flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Your resume is processed securely and never permanently stored.</span>
          </p>
        </div>
      </section>

      {/* Product Mockup Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-2xl border border-card-border bg-card/50 p-3 sm:p-4 shadow-2xl glass-panel">
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#0e0e11] border border-card-border relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-accent-secondary/5 mix-blend-screen pointer-events-none" />
            {/* Visual representation of dashboard */}
            <div className="p-6 h-full flex flex-col justify-between select-none">
              <div className="flex justify-between items-center border-b border-card-border/60 pb-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] font-bold text-muted bg-muted-bg px-3 py-0.5 rounded border border-card-border">jobmatchr.io/dashboard</span>
              </div>
              <div className="flex-1 flex gap-4 pt-4">
                <div className="w-1/4 border border-card-border/40 rounded-lg p-3 space-y-3 bg-muted-bg/10 hidden md:block">
                  <div className="h-3 w-3/4 rounded bg-card-border/50" />
                  <div className="space-y-1 pt-2">
                    <div className="h-2 w-full rounded bg-card-border/30" />
                    <div className="h-2 w-5/6 rounded bg-card-border/30" />
                    <div className="h-2 w-4/5 rounded bg-card-border/30" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="border border-card-border/40 rounded-xl p-4 flex justify-between items-center bg-card">
                    <div className="space-y-2">
                      <div className="h-4 w-48 rounded bg-card-border" />
                      <div className="h-3 w-32 rounded bg-card-border/50" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-accent flex items-center justify-center text-[10px] font-black text-accent">94%</div>
                  </div>
                  <div className="border border-card-border/40 rounded-xl p-4 flex justify-between items-center bg-card">
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-card-border" />
                      <div className="h-3 w-28 rounded bg-card-border/50" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-accent flex items-center justify-center text-[10px] font-black text-accent">87%</div>
                  </div>
                  <div className="border border-card-border/40 rounded-xl p-4 flex justify-between items-center bg-card opacity-50 blur-[1px]">
                    <div className="space-y-2">
                      <div className="h-4 w-44 rounded bg-card-border" />
                      <div className="h-3 w-36 rounded bg-card-border/50" />
                    </div>
                    <div className="h-6 w-14 rounded-full bg-card-border flex items-center justify-center"><Lock className="h-3.5 w-3.5 text-muted" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-card-border/40 mt-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Everything you need to land the job</h2>
          <p className="mt-3 text-sm text-muted max-w-xl mx-auto">
            Our AI analysis provides deep semantic matching, highlighting what works and what's missing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-card-border bg-card/40 p-6 hover:bg-card-border/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
              <Zap className="h-5 w-5 fill-accent/10" />
            </div>
            <h3 className="text-base font-extrabold mb-2">Instant Scanning</h3>
            <p className="text-xs text-muted leading-relaxed">
              Upload your PDF or Word resume. Our engine analyzes your background, skills, certifications, and experience in real-time.
            </p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card/40 p-6 hover:bg-card-border/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary mb-4">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold mb-2">ATS Score Analysis</h3>
            <p className="text-xs text-muted leading-relaxed">
              Find out how well your resume matches automated screening filters. Discover missing keywords required to unlock top tiers.
            </p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card/40 p-6 hover:bg-card-border/10 transition-colors duration-300">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold mb-2">Privacy First</h3>
            <p className="text-xs text-muted leading-relaxed">
              We process resumes temporarily. They are never saved permanently, keeping your personal contact details safe and private.
            </p>
          </div>
        </div>
      </section>

      {/* AI Matching Details explanation */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-card-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold">How our AI Matching Engine works</h2>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Rather than basic keyword matches, JobMatchr reads the semantic context of your experience. We cross-reference your tools and projects with active employer listings to yield a precise compatibility percentage.
            </p>
            <ul className="mt-6 space-y-3.5">
              {[
                "Semantic similarity matches of title and experience level",
                "Keyword validation of core tools and technical skills",
                "Action verbs check and achievement benchmarking",
                "Detailed breakdown of missing skills with learning guides"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="font-semibold text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-card-border bg-muted-bg/30 p-6 glass-panel">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Career Improvement Example</h4>
            <div className="space-y-4">
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-xs font-semibold text-muted">AI Insight Message</p>
                <p className="text-sm font-bold text-accent mt-1">“Learning Docker and Airflow could unlock 42 more matching jobs.”</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-xs font-semibold text-muted">Why it Matched Explanation</p>
                <p className="text-xs text-foreground/80 mt-1">“Matched because of your experience in React, TypeScript, and state management (Redux).”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-card-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold">Loved by candidates worldwide</h2>
          <p className="mt-3 text-sm text-muted">See what candidates are saying about JobMatchr.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-2xl border border-card-border bg-card/30 p-6 flex flex-col justify-between">
              <p className="text-xs leading-relaxed text-foreground/80 italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.avatar} alt={t.author} className="h-9 w-9 rounded-full object-cover border border-card-border" />
                <div>
                  <h4 className="text-xs font-bold">{t.author}</h4>
                  <p className="text-[10px] text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-card-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-sm text-muted">Find matching jobs for free, or upgrade for full optimization features.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-card-border bg-card/20 p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-bold">Free Plan</h3>
              <p className="mt-1 text-xs text-muted">Scan resumes and see top compatibility matches.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-muted">/ forever</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["Upload unlimited resumes", "Filter by remote/workplace/location", "View top 5 matching jobs", "Detailed resume parsing chips"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs">
                    <Check className="h-4 w-4 text-muted shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 block w-full rounded-xl bg-muted-bg text-center py-3 text-xs font-bold border border-card-border hover:bg-card-border transition-colors duration-200"
            >
              Start Free Scanning
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="rounded-2xl border border-accent bg-card/50 p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-accent/5">
            <div className="absolute top-0 right-0 rounded-bl-lg bg-accent px-3 py-1 text-[9px] font-extrabold text-white uppercase tracking-wider">
              Popular
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                <span>Premium Plan</span>
                <Sparkles className="h-4 w-4 text-accent fill-accent" />
              </h3>
              <p className="mt-1 text-xs text-muted">Unlock complete ATS analysis and all job matches.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$12</span>
                <span className="text-xs text-muted">/ month (billed yearly)</span>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  "Unlock all 100+ matching jobs",
                  "Advanced AI match & why matching",
                  "AI resume optimization & suggestions",
                  "ATS score assessment",
                  "Skill-gap analysis (missing skills details)",
                  "Custom job alerts & tailored bullet points"
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span className="font-semibold">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard?premium=true"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-center py-3 text-xs font-bold text-white shadow-lg shadow-accent/20 hover:brightness-110 active:scale-[0.99] transition-all duration-200"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border/40 bg-[#070708] py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted font-semibold">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-accent to-accent-secondary text-white">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">JobMatchr</span>
          </div>
          <p>© 2026 JobMatchr. All rights reserved. Secure session processing.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
