"use client";

import React, { useState } from "react";
import { Lock, MapPin, Briefcase, DollarSign, ChevronDown, ChevronUp, Check, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  id?: number;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  salary?: string;
  job_type: string;
  workplace_type: string;
  experience_level: string;
  role_category: string;
  company_type?: string;
  required_skills: string;
  description: string;
  apply_url: string;
  created_at?: string;
  match_percentage?: number;
  why_matched?: string;
  missing_skills?: string[];
  is_locked?: boolean;
}

interface JobCardProps {
  job: Job;
  onOpenUpgrade: () => void;
  hasResume: boolean;
}

export default function JobCard({ job, onOpenUpgrade, hasResume }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const skills = job.required_skills.split(",").map((s) => s.trim());
  const matchScore = job.match_percentage || 0;

  // Determine card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.is_locked) {
      onOpenUpgrade();
    } else {
      window.open(job.apply_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`group relative rounded-2xl border transition-all duration-300 ${
        job.is_locked
          ? "border-white/[0.04] bg-[#0B0B0F]/40 select-none overflow-hidden"
          : "border-white/[0.08] bg-[#0B0B0F] hover:bg-[#111118] hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/25"
      }`}
    >
      <div className="p-5 sm:p-6">
        
        {/* Top Header Row: Match Score & Job Title Info */}
        <div className="flex gap-4 items-start">
          
          {/* Prominent Match Score Gauge */}
          {hasResume && (
            <div className="relative shrink-0 h-16 w-16 flex items-center justify-center bg-[#111118] rounded-full border border-white/[0.06] shadow-inner">
              <svg className="h-full w-full -rotate-90">
                <defs>
                  {/* High Match Gradient */}
                  <linearGradient id={`high-grad-${job.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                    <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
                  </linearGradient>
                  {/* Mid Match Gradient */}
                  <linearGradient id={`mid-grad-${job.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                    <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
                  </linearGradient>
                  {/* Low Match Gradient */}
                  <linearGradient id={`low-grad-${job.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
                    <stop offset="100%" stopColor="#f59e0b" /> {/* Amber */}
                  </linearGradient>
                </defs>
                <circle
                  cx="32"
                  cy="32"
                  r="27"
                  className="stroke-white/[0.03] fill-transparent"
                  strokeWidth="3.5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="27"
                  className="fill-transparent"
                  stroke={`url(#${matchScore >= 85 ? "high" : matchScore >= 70 ? "mid" : "low"}-grad-${job.id})`}
                  strokeWidth="3.5"
                  strokeDasharray={`${2 * Math.PI * 27}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - (job.is_locked ? 0 : matchScore) / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[13px] font-black text-white ${job.is_locked ? "blur-[2px]" : ""}`}>
                  {job.is_locked ? "🔒" : `${matchScore}%`}
                </span>
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Match</span>
              </div>
            </div>
          )}

          {/* Job details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-base font-extrabold tracking-tight text-white ${job.is_locked ? "blur-[5px]" : "group-hover:text-accent transition-colors duration-200"}`}>
                {job.title}
              </h3>
              <span className="rounded-md bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                {job.job_type}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <div className={`h-5 w-5 shrink-0 rounded overflow-hidden border border-white/[0.06] flex items-center justify-center bg-[#111118] text-[9px] font-black text-zinc-500 ${job.is_locked ? "blur-[2px]" : ""}`}>
                {job.company_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.company_logo}
                    alt={job.company_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span>{job.company_name.substring(0, 2).toUpperCase()}</span>
              </div>
              <span className={job.is_locked ? "blur-[3px]" : ""}>{job.company_name}</span>
              <span className="text-zinc-600">•</span>
              <span className={job.is_locked ? "blur-[3px]" : ""}>{job.company_type || "Corporate"}</span>
            </div>
          </div>

        </div>

        {/* Secondary Metadata Info (Location, Workplace, Salary) */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/[0.04] pt-3.5">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold bg-[#111118]/50 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <MapPin className="h-3 w-3 text-zinc-500" />
            <span className={job.is_locked ? "blur-[3px]" : ""}>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold bg-[#111118]/50 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <Briefcase className="h-3 w-3 text-zinc-500" />
            <span>{job.workplace_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold bg-[#111118]/50 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <DollarSign className="h-3 w-3 text-zinc-500" />
            <span className={job.is_locked ? "blur-[4px]" : ""}>{job.salary || "Salary Undisclosed"}</span>
          </div>
        </div>

        {/* Required Skills Chips */}
        <div className="mt-4">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`rounded bg-[#111118] px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-white/[0.06] ${job.is_locked && index > 1 ? "blur-[3px]" : ""}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* AI Explanatory matching reasoning */}
        {!job.is_locked && hasResume && job.why_matched && (
          <div className="mt-4 rounded-xl bg-accent/[0.03] border border-accent/15 p-3.5 text-[11px] leading-relaxed text-zinc-300 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-accent fill-accent/10 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-white">System Insights: </span>
              {job.why_matched}
            </p>
          </div>
        )}

        {/* Accordion expand block */}
        {!job.is_locked && (
          <>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-4 text-xs">
                    <div>
                      <h4 className="font-black text-zinc-500 uppercase tracking-widest text-[9px] mb-2">Job Description</h4>
                      <p className="text-zinc-400 leading-relaxed max-h-36 overflow-y-auto pr-2 font-semibold whitespace-pre-line">
                        {job.description}
                      </p>
                    </div>

                    {hasResume && job.missing_skills && job.missing_skills.length > 0 && (
                      <div className="border-t border-white/[0.04] pt-3.5">
                        <h4 className="font-black text-zinc-500 uppercase tracking-widest text-[9px] mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span>Detected Skill Gaps</span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {job.missing_skills.map((s, idx) => (
                            <span key={idx} className="rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 text-[9px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-200"
            >
              {expanded ? (
                <>
                  <span>Collapse info</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Expand details</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </>
        )}

        {/* CTA Bottom Section */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleActionClick}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all duration-200 active:scale-[0.99] border ${
              job.is_locked
                ? "bg-[#111118] border-white/[0.06] text-zinc-400 hover:bg-[#181824] hover:text-white"
                : "bg-gradient-to-r from-accent to-accent-secondary text-white border-transparent shadow hover:brightness-105"
            }`}
          >
            {job.is_locked ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Unlock Match Index</span>
              </>
            ) : (
              <>
                <span>Apply to Position</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lock blur panel for premium overlay (using soft-edge content fade logic) */}
      {job.is_locked && (
        <div className="absolute inset-0 bg-[#050505]/40 backdrop-blur-[3.5px] rounded-2xl flex items-center justify-center p-4">
          <div className="flex flex-col items-center bg-[#0B0B0F] border border-white/[0.08] rounded-2xl p-5 text-center max-w-[85%] shadow-2xl relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-accent/20 blur-xl pointer-events-none rounded-full" />
            
            <Lock className="h-5 w-5 text-accent mb-2.5 z-10" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider z-10">Premium Match Locked</h4>
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-semibold z-10">
              This card contains complete details, ATS scoring checklists, and application links.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenUpgrade();
              }}
              className="mt-4 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-white font-black text-[9px] px-4 py-2 uppercase tracking-widest active:scale-95 transition-transform duration-150 shadow-md shadow-accent/20 z-10"
            >
              Unlock Dashboard
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
