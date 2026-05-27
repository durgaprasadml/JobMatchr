"use client";

import React, { useState } from "react";
import { Lock, MapPin, Briefcase, DollarSign, ChevronDown, ChevronUp, Check, ExternalLink } from "lucide-react";

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

  // Determine match color class
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 stroke-emerald-500";
    if (score >= 60) return "text-indigo-500 stroke-indigo-500";
    return "text-amber-500 stroke-amber-500";
  };

  const scoreColorClass = getScoreColor(matchScore);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.is_locked) {
      onOpenUpgrade();
    } else {
      window.open(job.apply_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 ${
        job.is_locked
          ? "border-card-border/50 bg-card/10 select-none overflow-hidden"
          : "border-card-border bg-card hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {/* Logo placeholder */}
            <div className={`h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-card-border flex items-center justify-center bg-muted-bg text-sm font-black ${job.is_locked ? "blur-[2px]" : ""}`}>
              {job.company_logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to monogram
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="text-muted">{job.company_name.substring(0, 2).toUpperCase()}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-base font-extrabold tracking-tight ${job.is_locked ? "blur-[6px]" : "group-hover:text-accent transition-colors duration-200"}`}>
                  {job.title}
                </h3>
                <span className="rounded bg-muted-bg px-2 py-0.5 text-[10px] font-bold border border-card-border">
                  {job.job_type}
                </span>
              </div>
              <p className={`text-xs font-semibold text-muted ${job.is_locked ? "blur-[4px]" : ""}`}>
                {job.company_name} • {job.company_type || "Company"}
              </p>
            </div>
          </div>

          {/* AI Match Score Radial Gauge */}
          {hasResume && (
            <div className="relative shrink-0 flex h-14 w-14 items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  className="stroke-card-border fill-transparent"
                  strokeWidth="3.5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  className={`fill-transparent transition-all duration-1000 ${scoreColorClass}`}
                  strokeWidth="3.5"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - (job.is_locked ? 0 : matchScore) / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xs font-extrabold ${job.is_locked ? "blur-[2px]" : ""}`}>
                  {job.is_locked ? "🔒" : `${matchScore}%`}
                </span>
                <span className="text-[7px] text-muted font-bold uppercase tracking-wider">Match</span>
              </div>
            </div>
          )}
        </div>

        {/* Job Tags Row */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <div className="flex items-center gap-1 text-[11px] text-muted font-semibold bg-muted-bg/50 px-2 py-0.5 rounded border border-card-border/60">
            <MapPin className="h-3 w-3" />
            <span className={job.is_locked ? "blur-[3px]" : ""}>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted font-semibold bg-muted-bg/50 px-2 py-0.5 rounded border border-card-border/60">
            <Briefcase className="h-3 w-3" />
            <span>{job.workplace_type}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted font-semibold bg-muted-bg/50 px-2 py-0.5 rounded border border-card-border/60">
            <DollarSign className="h-3 w-3" />
            <span className={job.is_locked ? "blur-[5px]" : ""}>{job.salary || "Not Specified"}</span>
          </div>
        </div>

        {/* Required Skills Chips */}
        <div className="mt-4">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`rounded-md bg-muted-bg px-2 py-1 text-[11px] font-semibold border border-card-border/80 ${job.is_locked && index > 1 ? "blur-[4px]" : ""}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Why Matched explanation (when resume uploaded) */}
        {!job.is_locked && hasResume && job.why_matched && (
          <div className="mt-4 rounded-xl bg-accent/5 border border-accent/15 p-3 text-xs leading-relaxed text-foreground/90">
            <span className="font-extrabold text-accent">AI Match: </span>
            {job.why_matched}
          </div>
        )}

        {/* Expandable Section - Details, Missing Skills */}
        {!job.is_locked && (
          <>
            {expanded && (
              <div className="mt-5 pt-4 border-t border-card-border/80 space-y-4 text-xs animate-fadeIn">
                <div>
                  <h4 className="font-bold text-muted uppercase tracking-wider text-[10px] mb-1.5">Description</h4>
                  <p className="text-foreground/80 leading-relaxed max-h-36 overflow-y-auto pr-2">{job.description}</p>
                </div>

                {hasResume && job.missing_skills && job.missing_skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-muted uppercase tracking-wider text-[10px] mb-1.5">Missing Skills Analysis</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.missing_skills.map((s, idx) => (
                        <span key={idx} className="rounded-md bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-[11px] font-bold text-muted hover:text-foreground transition-colors duration-200"
            >
              {expanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>View Details & Skill Gap</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </>
        )}

        {/* Bottom CTA / Lock Overlay */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleActionClick}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
              job.is_locked
                ? "bg-muted-bg border border-card-border hover:bg-card-border text-muted-foreground"
                : "bg-gradient-to-r from-accent to-accent-secondary text-white shadow hover:brightness-110"
            }`}
          >
            {job.is_locked ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Unlock Details with Premium</span>
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

      {/* Lock blur panel for premium overlay */}
      {job.is_locked && (
        <div className="absolute inset-0 bg-black/5 hover:bg-black/10 backdrop-blur-[2.5px] rounded-2xl flex items-center justify-center p-4">
          <div className="flex flex-col items-center bg-card/90 border border-card-border/80 rounded-xl p-4 text-center max-w-[80%] shadow-lg">
            <Lock className="h-5 w-5 text-accent mb-2" />
            <h4 className="text-xs font-bold text-foreground">Premium Match</h4>
            <p className="text-[10px] text-muted mt-1 leading-snug">
              Unlock this and 83 more matching jobs with Premium
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenUpgrade();
              }}
              className="mt-3 rounded bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-extrabold text-[10px] px-3 py-1 uppercase tracking-wider"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
