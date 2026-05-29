"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart2, 
  Check, 
  Briefcase, 
  Lock, 
  FileText, 
  Cpu, 
  TrendingUp, 
  Terminal, 
  Search,
  Eye,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // 3D Tilt Effect for Floating Mockup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const premium = localStorage.getItem("isPremium") === "true";
    if (email) {
      setUserEmail(email);
      setIsPremium(premium);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isPremium");
    setUserEmail(null);
    setIsPremium(false);
  };

  const features = [
    {
      title: "Intelligent ATS Profiling",
      description: "Instantly score your resume against corporate filtering standards and find formatting flags before HR does.",
      icon: BarChart2,
      badge: "ATS Benchmarking",
      color: "from-indigo-500/20 to-indigo-500/5",
      iconColor: "text-indigo-400"
    },
    {
      title: "Semantic Skill-Gap Mapping",
      description: "Don't just search keywords. Our AI maps the contextual relationship of your engineering stack and highlights critical missing dependencies.",
      icon: Cpu,
      badge: "Semantic Matching",
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-400"
    },
    {
      title: "Real-time Live Job Scrapes",
      description: "Direct integrations with modern job portals like JSearch to pull active openings, mapping your profile matches live within seconds.",
      icon: Zap,
      badge: "Live Indexing",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400"
    }
  ];

  const workflowSteps = [
    {
      title: "Semantic Analysis",
      desc: "Our AI breaks your resume into a clean JSON structure of technical strengths, soft skills, and credentials.",
      content: (
        <div className="bg-[#111118]/80 border border-white/[0.06] rounded-xl p-5 font-mono text-[11px] leading-relaxed text-zinc-300">
          <div className="text-zinc-500">// AI Parsing Output</div>
          <div>{"{"}</div>
          <div className="pl-4"><span className="text-indigo-400">"candidate"</span>: "Alex Rivers",</div>
          <div className="pl-4"><span className="text-indigo-400">"experience_level"</span>: "Mid-Senior",</div>
          <div className="pl-4"><span className="text-indigo-400">"core_stack"</span>: ["React", "TypeScript", "Next.js", "Tailwind"],</div>
          <div className="pl-4"><span className="text-indigo-400">"inferred_specialty"</span>: "Frontend & UI UX Engineering"</div>
          <div>{"}"}</div>
        </div>
      )
    },
    {
      title: "ATS Optimization",
      desc: "Instantly identify keyword blockages and layout errors that prevent resumes from passing automated ATS screening.",
      content: (
        <div className="bg-[#111118]/80 border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-200">ATS Assessment</span>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">84% Compatible</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
              <span>Missing Keywords</span>
              <span className="text-red-400">Critical</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {["Docker", "CI/CD", "Jest"].map(s => (
                <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Live Match Delivery",
      desc: "Our matching engine indexes active openings on live job servers and surfaces roles with highest semantic compatibility.",
      content: (
        <div className="bg-[#111118]/80 border border-white/[0.06] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-white">Staff Frontend Engineer</h4>
              <p className="text-[10px] text-zinc-400">Vercel • San Francisco, CA</p>
            </div>
            <div className="h-9 w-9 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-400 bg-indigo-500/5 shadow-[0_0_8px_rgba(99,102,241,0.2)]">96%</div>
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-300 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-lg">
            <span className="font-extrabold text-indigo-400">AI Match:</span> Strong alignment with your custom React frameworks and server components experience.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background bg-grid-pattern relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[20%] -z-10 h-[600px] w-[600px] rounded-full bg-accent-glow blur-[140px] pointer-events-none opacity-45" />
      <div className="absolute top-[35%] right-[15%] -z-10 h-[500px] w-[500px] rounded-full bg-accent-secondary/5 blur-[140px] pointer-events-none opacity-25" />

      {/* Nav */}
      <Navbar
        userEmail={userEmail}
        isPremium={isPremium}
        onOpenAuth={() => {
          window.location.href = "/dashboard?auth=true";
        }}
        onLogout={handleLogout}
        sessionId={null}
        onRescan={() => {}}
      />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl flex flex-col items-center"
        >
          {/* Tagline */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted-bg border border-card-border px-3.5 py-1 text-[11px] font-bold text-zinc-300 mb-8 shadow-md hover:border-accent/30 transition-all duration-300">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>Introducing JobMatchr 1.0 — Career Intelligence OS</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.1] max-w-3xl">
            Your resume already knows{" "}
            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              your next job.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            An AI career operating system built around your skills. Upload your resume to benchmark your stack, resolve hidden ATS filters, and unlock direct, live job matches.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Link
              href="/dashboard"
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-accent/20 hover:brightness-105 active:scale-[0.98] transition-all duration-200"
            >
              <span>Build Career Profile</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-card-border bg-card/60 px-8 py-4 text-sm font-bold hover:bg-[#111118] hover:border-zinc-700 transition-all duration-200"
            >
              Learn System Mechanics
            </Link>
          </div>

          {/* Privacy text */}
          <p className="mt-5 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted transmission. Resumes are analyzed in memory and never stored.</span>
          </p>
        </motion.div>
      </section>

      {/* Floating 3D Product Mockup Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: "preserve-3d",
            perspective: 1200
          }}
          className="relative rounded-2xl border border-card-border bg-[#0B0B0F]/80 p-3 shadow-2xl glass-panel group transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]"
        >
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#050505] border border-white/[0.04] relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-accent-secondary/5 mix-blend-screen pointer-events-none" />
            
            {/* Dashboard Mock UI */}
            <div className="p-4 sm:p-6 h-full flex flex-col justify-between select-none font-sans text-left">
              {/* Window Bar */}
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 bg-[#111118] px-3.5 py-1 rounded-full border border-white/[0.06] tracking-wide">
                  jobmatchr.io/workspace
                </span>
                <span className="w-10" />
              </div>
              
              {/* Grid content */}
              <div className="flex-1 flex gap-5 pt-5 overflow-hidden">
                
                {/* Left Drawer (Filters) */}
                <div className="w-[180px] border border-white/[0.06] rounded-xl p-3.5 space-y-3.5 bg-[#0B0B0F]/40 hidden md:block">
                  <div className="h-2.5 w-1/2 rounded bg-white/15" />
                  <div className="space-y-2 pt-1">
                    <div className="h-5 w-full rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center px-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-2" />
                      <div className="h-1.5 w-12 rounded bg-indigo-400/40" />
                    </div>
                    <div className="h-5 w-4/5 rounded-lg border border-white/[0.06] bg-white/[0.01]" />
                    <div className="h-5 w-full rounded-lg border border-white/[0.06] bg-white/[0.01]" />
                  </div>
                </div>

                {/* Center Feed (Job Cards) */}
                <div className="flex-1 space-y-3 overflow-hidden">
                  <div className="border border-white/[0.06] rounded-xl p-4 flex justify-between items-center bg-[#0B0B0F] hover:border-indigo-500/30 transition-colors duration-200">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-32 rounded bg-white/15" />
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[8px] font-bold text-zinc-400">Full-Time</span>
                      </div>
                      <div className="h-2 w-20 rounded bg-zinc-600" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-emerald-500/80 flex items-center justify-center text-[10px] font-black text-emerald-400 bg-emerald-500/5">94%</div>
                  </div>
                  
                  <div className="border border-white/[0.06] rounded-xl p-4 flex justify-between items-center bg-[#0B0B0F]">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-24 rounded bg-white/15" />
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[8px] font-bold text-zinc-400">Remote</span>
                      </div>
                      <div className="h-2 w-16 rounded bg-zinc-600" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-400 bg-indigo-500/5">87%</div>
                  </div>
                  
                  <div className="border border-white/[0.06] rounded-xl p-4 flex justify-between items-center bg-[#0B0B0F]/30 opacity-40 blur-[0.5px]">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-white/10" />
                      <div className="h-2 w-24 rounded bg-zinc-700" />
                    </div>
                    <div className="h-6 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Lock className="h-3 w-3 text-zinc-500" />
                    </div>
                  </div>
                </div>

                {/* Right Drawer (AI Profile - Sticky) */}
                <div className="w-[200px] border border-white/[0.06] rounded-xl p-3.5 bg-[#0B0B0F]/60 space-y-4 hidden lg:block">
                  <div className="flex flex-col items-center border-b border-white/[0.06] pb-3 text-center">
                    <div className="h-14 w-14 rounded-full border-2 border-indigo-500 flex items-center justify-center font-black text-sm text-indigo-400 bg-indigo-500/5 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                      88
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">ATS Compatibility</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-1/2 rounded bg-zinc-500" />
                    <div className="flex flex-wrap gap-1">
                      {["React", "TypeScript", "NextJS"].map(t => (
                        <span key={t} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 font-semibold">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 border-t border-white/[0.06] mt-16 relative z-20">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Engineered for Modern Careers</h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            JobMatchr bypasses baseline keyword matching to deliver deep semantic intelligence across your experience profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-card-border bg-[#0B0B0F] p-7 transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1"
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${feat.color} border border-white/[0.06] flex items-center justify-center ${feat.iconColor} mb-6 shadow-inner`}>
                <feat.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                {feat.badge}
              </span>
              <h3 className="text-base font-extrabold text-white mt-4 mb-2">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works / Interactive Demonstration Walkthrough */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              An intelligent pipeline in three stages
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Upload your PDF or Word resume. Our parser decodes the experience structures, matches credentials, and highlights active positions matching your career path.
            </p>

            <div className="space-y-2 mt-8">
              {workflowSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                    activeStep === idx 
                      ? "bg-[#0B0B0F] border-accent/40 shadow-lg shadow-accent/5" 
                      : "bg-transparent border-transparent hover:bg-white/[0.01]"
                  }`}
                >
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    activeStep === idx ? "bg-accent text-white" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                      activeStep === idx ? "text-white" : "text-zinc-400"
                    }`}>
                      {step.title}
                    </h4>
                    {activeStep === idx && (
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1 animate-fadeIn">{step.desc}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0B0B0F] p-6 glass-panel relative overflow-hidden flex flex-col justify-center min-h-[300px]">
            {/* Holographic light reflection */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent-secondary/5 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-accent" />
                  <span>Pipeline Demonstration</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="transition-all duration-300">
                {workflowSteps[activeStep].content}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06] relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">Transparent System Subscriptions</h2>
          <p className="mt-3 text-sm text-zinc-400">Upload and parser benchmarking are completely free. Upgrade for full match indexes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-card-border bg-[#0B0B0F]/50 p-8 flex flex-col justify-between relative overflow-hidden transition-colors hover:border-zinc-700">
            <div>
              <h3 className="text-lg font-bold text-white">Free Sandbox</h3>
              <p className="mt-1 text-xs text-zinc-400">Scan resumes and see top compatibility matches.</p>
              <div className="mt-5 flex items-baseline gap-1.5 text-white">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-zinc-400">/ forever</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["Upload resumes in PDF format", "Filter by workspace, roles, and tags", "View top 5 matching opportunities", "ATS structural summary parsing"].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-400">
                    <Check className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 block w-full rounded-xl bg-[#111118] text-center py-3.5 text-xs font-bold border border-white/[0.06] hover:bg-[#181824] hover:border-zinc-600 text-white transition-all duration-200"
            >
              Initialize Scan
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="rounded-2xl border border-accent bg-[#0B0B0F]/90 p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-accent/5">
            <div className="absolute top-0 right-0 rounded-bl-lg bg-accent px-3 py-1.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
              System Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>Premium Access</span>
                <Sparkles className="h-4 w-4 text-accent fill-accent" />
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Unlock complete ATS reports and all verified jobs.</p>
              <div className="mt-5 flex items-baseline gap-1.5 text-white">
                <span className="text-4xl font-extrabold">$12</span>
                <span className="text-xs text-zinc-400">/ month (billed yearly)</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  "Unlock 100+ matching vacancies (no blurs)",
                  "Granular AI match reasoning & contextual flags",
                  "ATS compliance analysis & scoring reports",
                  "Missing skill gap alerts & reference manuals",
                  "Custom job alerts & automated dashboard feeds",
                  "Resume optimization & customized bullet points"
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-white">
                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span className="font-semibold">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard?premium=true"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-center py-3.5 text-xs font-bold text-white shadow-lg shadow-accent/20 hover:brightness-105 active:scale-[0.99] transition-all duration-200"
            >
              Upgrade System Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#030303] py-12 mt-auto relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-semibold">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-accent to-accent-secondary text-white">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-white">JobMatchr</span>
          </div>
          <p>© 2026 JobMatchr. All rights reserved. Secure session-based scanning.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">System Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
