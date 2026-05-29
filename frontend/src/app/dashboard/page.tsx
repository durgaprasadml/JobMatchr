"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  BarChart2, 
  Award, 
  Star, 
  ListFilter, 
  AlertCircle, 
  RefreshCw, 
  User, 
  GraduationCap, 
  Briefcase,
  ChevronRight,
  TrendingUp,
  FolderKanban,
  Zap,
  Lock,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import UploadArea from "../../components/UploadArea";
import SidebarFilters from "../../components/SidebarFilters";
import JobCard from "../../components/JobCard";
import AuthModal from "../../components/AuthModal";
import UpgradeModal from "../../components/UpgradeModal";

const API_URL = "http://localhost:8000/api";

interface ResumeData {
  full_name: string;
  skills: string[];
  technical_skills: string[];
  soft_skills: string[];
  education: string[];
  certifications: string[];
  projects: string[];
  experience_level: string;
  years_of_experience: number;
  suggested_roles: string[];
  ats_score: number;
  missing_skills: string[];
  strong_areas: string[];
  resume_summary: string;
}

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

interface SavedJob {
  id: number;
  job: Job;
}

export default function Dashboard() {
  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Resume Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Job Listing state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matchingLive, setMatchingLive] = useState(false);
  const [activeTab, setActiveTab] = useState<"matching" | "saved" | "profile">("matching");

  // Mobile filters open state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    q: "",
    location: "",
    job_type: "",
    workplace_type: "",
    experience_level: "",
    role_category: "",
    company_type: "",
  });

  // Load state from Storage on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const premium = localStorage.getItem("isPremium") === "true";
    
    const sId = sessionStorage.getItem("resumeSessionId");
    const cachedResume = sessionStorage.getItem("resumeData");

    if (email) {
      setUserEmail(email);
      setIsPremium(premium);
    }
    
    if (sId && cachedResume) {
      setSessionId(sId);
      setResumeData(JSON.parse(cachedResume));
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("auth") === "true") {
      setAuthModalOpen(true);
    }
    if (searchParams.get("premium") === "true") {
      setUpgradeModalOpen(true);
    }
  }, []);

  // Fetch Jobs — uses JSearch live matching when resume session is active
  const fetchJobs = useCallback(async (currentSessionId: string | null, emailStr: string | null, currentFilters: typeof filters) => {
    setLoadingJobs(true);
    try {
      if (currentSessionId) {
        const params = new URLSearchParams();
        params.append("session_id", currentSessionId);
        if (emailStr) params.append("email", emailStr);

        const response = await fetch(`${API_URL}/match-jobs?${params.toString()}`, {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } else {
        const params = new URLSearchParams();
        if (emailStr) params.append("email", emailStr);
        Object.entries(currentFilters).forEach(([key, val]) => {
          if (val) params.append(key, val);
        });

        const response = await fetch(`${API_URL}/jobs?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
      setMatchingLive(false);
    }
  }, []);

  // Fetch Saved Jobs
  const fetchSavedJobs = useCallback(async (emailStr: string) => {
    try {
      const response = await fetch(`${API_URL}/saved-jobs?email=${encodeURIComponent(emailStr)}`);
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data);
      }
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
  }, []);

  // Trigger job fetch when session, user, or filters change
  useEffect(() => {
    fetchJobs(sessionId, userEmail, filters);
    
    if (userEmail) {
      fetchSavedJobs(userEmail);
    } else {
      setSavedJobs([]);
    }
  }, [sessionId, userEmail, filters, fetchJobs, fetchSavedJobs]);

  // Handle successful resume upload — triggers live job matching
  const handleUploadSuccess = (sId: string, data: ResumeData) => {
    setSessionId(sId);
    setResumeData(data);
    setMatchingLive(true);
    setActiveTab("matching");
    
    sessionStorage.setItem("resumeSessionId", sId);
    sessionStorage.setItem("resumeData", JSON.stringify(data));

    fetchJobs(sId, userEmail, filters);
  };

  // Handle active session reset (rescan another resume)
  const handleRescan = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_URL}/resume/rescan?session_id=${sessionId}`, { method: "POST" });
      } catch (err) {
        console.error(err);
      }
    }
    
    setSessionId(null);
    setResumeData(null);
    sessionStorage.removeItem("resumeSessionId");
    sessionStorage.removeItem("resumeData");
    setActiveTab("matching");
  };

  // Handle simulated login success
  const handleAuthSuccess = (email: string, token: string, premium: boolean) => {
    setUserEmail(email);
    setIsPremium(premium);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("isPremium", String(premium));
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isPremium");
    setUserEmail(null);
    setIsPremium(false);
    setActiveTab("matching");
  };

  // Handle premium upgrade
  const handleUpgradeSuccess = async () => {
    if (!userEmail) {
      setAuthModalOpen(true);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/user/premium?email=${encodeURIComponent(userEmail)}`, {
        method: "POST",
      });
      if (response.ok) {
        setIsPremium(true);
        localStorage.setItem("isPremium", "true");
        fetchJobs(sessionId, userEmail, filters);
      }
    } catch (err) {
      setIsPremium(true);
      localStorage.setItem("isPremium", "true");
      fetchJobs(sessionId, userEmail, filters);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      q: "",
      location: "",
      job_type: "",
      workplace_type: "",
      experience_level: "",
      role_category: "",
      company_type: "",
    });
  };

  const lockedCount = Math.max(0, jobs.length - 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Background radial glow */}
      <div className="absolute top-0 right-10 -z-10 h-[350px] w-[350px] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-20" />

      {/* Navbar */}
      <Navbar
        userEmail={userEmail}
        isPremium={isPremium}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        sessionId={sessionId}
        onRescan={handleRescan}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* If no resume session -> Show Resume Upload Area */}
        {!sessionId && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-3xl mx-auto text-center space-y-5"
          >
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Benchmark Your Skills Against Live Openings
            </h1>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Upload your resume to calculate semantic match ratios, compile ATS compliance audits, and identify critical tool gaps.
            </p>
            <UploadArea onUploadSuccess={handleUploadSuccess} apiUrl={API_URL} />
          </motion.div>
        )}

        {/* 3-Column Dashboard Workspace Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COLUMN 1: Left Sticky Filters (Collapsible mobile drawer handled inside SidebarFilters) */}
          <SidebarFilters
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          />

          {/* COLUMN 2: Center Job Matches Feed */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Header Tabs / Dashboard Navigation */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("matching")}
                  className={`relative pb-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeTab === "matching"
                      ? "text-accent"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span>AI Matching Feed</span>
                  {sessionId && (
                    <span className="ml-2 rounded-full bg-accent/10 border border-accent/20 px-2 py-0.2 text-[9px] font-black text-accent">
                      {jobs.length}
                    </span>
                  )}
                  {activeTab === "matching" && (
                    <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
                
                {userEmail && (
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`relative pb-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "saved"
                        ? "text-accent"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span>Saved Roles</span>
                    <span className="ml-2 rounded-full bg-white/5 border border-white/10 px-2 py-0.2 text-[9px] font-bold text-zinc-400">
                      {savedJobs.length}
                    </span>
                    {activeTab === "saved" && (
                      <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                    )}
                  </button>
                )}

                {/* Mobile/Tablet AI Profile Tab */}
                {sessionId && (
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`relative pb-4 text-xs font-bold uppercase tracking-wider lg:hidden transition-all duration-200 ${
                      activeTab === "profile"
                        ? "text-accent"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span>AI Profile Insights</span>
                    {activeTab === "profile" && (
                      <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                    )}
                  </button>
                )}
              </div>

              {/* Mobile Filter toggle button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0B0B0F] px-4 py-2 text-xs font-bold text-zinc-300 md:hidden hover:bg-[#111118]"
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Content Feed Switch */}
            <AnimatePresence mode="wait">
              {activeTab === "matching" ? (
                <motion.div
                  key="matching-feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Live matching loader skeletons */}
                  {loadingJobs ? (
                    <div className="grid grid-cols-1 gap-4">
                      {matchingLive && (
                        <div className="rounded-2xl border border-accent/20 bg-[#0B0B0F]/90 p-5 flex items-center gap-4 animate-pulse">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-extrabold text-white">Indexing live vacancies...</p>
                            <p className="text-xs text-zinc-400">Comparing details against job databases on JSearch API</p>
                          </div>
                        </div>
                      )}
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-6 space-y-4">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#111118] shimmer-bg border border-white/[0.04]" />
                            <div className="space-y-2.5 flex-1">
                              <div className="h-4 w-1/3 rounded bg-[#111118] shimmer-bg" />
                              <div className="h-3.5 w-1/4 rounded bg-[#111118] shimmer-bg" />
                            </div>
                          </div>
                          <div className="h-3.5 w-full rounded bg-[#111118] shimmer-bg" />
                          <div className="h-3.5 w-5/6 rounded bg-[#111118] shimmer-bg" />
                          <div className="flex gap-2">
                            <div className="h-6 w-16 rounded bg-[#111118] shimmer-bg" />
                            <div className="h-6 w-16 rounded bg-[#111118] shimmer-bg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : jobs.length === 0 ? (
                    /* Empty Feed State */
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-12 text-center"
                    >
                      <AlertCircle className="mx-auto h-9 w-9 text-zinc-500 mb-4" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">No job matches located</h3>
                      <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-semibold">
                        {sessionId
                          ? "No vacancies currently match this resume stack. Try tweaking search parameters or upload an alternate version."
                          : "No items correspond with the selected filter values. Try clearing sidebar fields."}
                      </p>
                    </motion.div>
                  ) : (
                    /* Cards Feed */
                    <div className="space-y-4">
                      {sessionId && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold px-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          <span>Showing {jobs.length} semantic openings matched to your resume</span>
                        </div>
                      )}
                      
                      {/* Premium Unlock Banner */}
                      {!isPremium && lockedCount > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-gradient-to-r from-accent/15 via-accent-secondary/5 to-transparent border border-accent/25 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden"
                        >
                          {/* Glow overlay */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-2xl pointer-events-none rounded-full" />
                          
                          <div className="space-y-1.5 z-10">
                            <p className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                              <Zap className="h-4 w-4 text-accent fill-accent" /> Unlock {lockedCount} additional AI-matched opportunities
                            </p>
                            <p className="text-xs text-zinc-400 font-semibold">
                              View detailed ATS match breakdowns, core skill gaps, and access direct application links.
                            </p>
                          </div>
                          <button
                            onClick={() => setUpgradeModalOpen(true)}
                            className="rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-5 py-2.5 text-xs font-black text-white shadow-md shadow-accent/25 hover:brightness-105 shrink-0 transition-transform duration-200 active:scale-[0.98] z-10"
                          >
                            Upgrade Subscription
                          </button>
                        </motion.div>
                      )}

                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-4"
                      >
                        {jobs.map((job, idx) => (
                          <JobCard
                            key={job.id ?? `${job.title}-${job.company_name}-${idx}`}
                            job={job}
                            hasResume={!!sessionId}
                            onOpenUpgrade={() => setUpgradeModalOpen(true)}
                          />
                        ))}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === "saved" ? (
                /* Saved Jobs Panel */
                <motion.div
                  key="saved-feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {savedJobs.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-12 text-center">
                      <Star className="mx-auto h-9 w-9 text-zinc-500 mb-4" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">No saved jobs</h3>
                      <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-semibold">
                        Toggle the star icon on active job listings to index positions here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {savedJobs.map((saved) => (
                        <JobCard
                          key={saved.id}
                          job={saved.job}
                          hasResume={!!sessionId}
                          onOpenUpgrade={() => setUpgradeModalOpen(true)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Mobile Tab AI Profile (Hidden on lg+ but visible on mobile) */
                <motion.div
                  key="mobile-profile-feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden"
                >
                  {resumeData && (
                    <AIProfileWidget 
                      resumeData={resumeData} 
                      onRescan={handleRescan} 
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* COLUMN 3: Right Sticky AI Profile & ATS Panel (Desktop only) */}
          {sessionId && resumeData && (
            <div className="hidden lg:block w-80 shrink-0 sticky top-24 self-start">
              <AIProfileWidget 
                resumeData={resumeData} 
                onRescan={handleRescan} 
              />
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#030303] py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-semibold">
          <span>JobMatchr © 2026. Secure cryptographic session processing.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        apiUrl={API_URL}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}

/* AI Profile Sidebar Panel Component */
function AIProfileWidget({ resumeData, onRescan }: { resumeData: ResumeData; onRescan: () => void }) {
  const [eduExpanded, setEduExpanded] = useState(false);
  const [projExpanded, setProjExpanded] = useState(false);
  
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-5 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative top lighting glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-accent/5 blur-2xl pointer-events-none rounded-full" />
      
      {/* Header Profile Title */}
      <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 z-10 relative">
        <div className="space-y-1 max-w-[70%]">
          <h3 className="text-sm font-black text-white truncate" title={resumeData.full_name}>
            {resumeData.full_name}
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate" title={resumeData.suggested_roles?.join(", ")}>
            {resumeData.suggested_roles?.[0] || "Engineer"}
          </p>
          <p className="text-[10px] text-zinc-500 font-semibold">
            {resumeData.experience_level} • {resumeData.years_of_experience} {resumeData.years_of_experience === 1 ? 'Year' : 'Years'}
          </p>
        </div>
        <button
          onClick={onRescan}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 border border-white/[0.06] bg-[#111118] px-2 py-1 rounded"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>Rescan</span>
        </button>
      </div>

      {/* ATS score indicator */}
      <div className="flex flex-col items-center justify-center py-2 relative z-10">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#111118]/40 border border-white/[0.04] shadow-inner shadow-black">
          {/* Radial progress ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              className="stroke-white/[0.03] fill-transparent"
              strokeWidth="5"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="48"
              className="fill-transparent stroke-accent"
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 48}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - (resumeData.ats_score || 80) / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white tracking-tighter">{resumeData.ats_score || 80}</span>
            <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase mt-0.5">SCORE</span>
          </div>
        </div>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">ATS Compatibility Assessment</span>
      </div>

      {/* Executive Summary */}
      {resumeData.resume_summary && (
        <div className="space-y-2 border-t border-white/[0.06] pt-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-accent" />
            <span>Executive Summary</span>
          </h4>
          <p className="text-[11px] leading-relaxed text-zinc-400 font-semibold bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
            {resumeData.resume_summary}
          </p>
        </div>
      )}

      {/* Skills Grid */}
      <div className="space-y-4 border-t border-white/[0.06] pt-4">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Technical Capabilities</h4>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
            {resumeData.technical_skills?.map((skill, idx) => (
              <span
                key={idx}
                className="rounded bg-[#111118] border border-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {resumeData.soft_skills && resumeData.soft_skills.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Professional Skills</h4>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {resumeData.soft_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded bg-[#111118] border border-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strong Areas */}
      {resumeData.strong_areas && resumeData.strong_areas.length > 0 && (
        <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strong Profile Areas</span>
          </h4>
          <div className="space-y-2">
            {resumeData.strong_areas.slice(0, 3).map((strong, idx) => (
              <div key={idx} className="flex gap-2 text-[11px] leading-relaxed text-zinc-400 font-semibold">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{strong}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education - Collapsible */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4">
          <button
            onClick={() => setEduExpanded(!eduExpanded)}
            className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-accent" />
              <span>Education</span>
            </span>
            <ChevronRight className={`h-3.5 w-3.5 transform transition-transform duration-200 ${eduExpanded ? "rotate-90" : ""}`} />
          </button>
          
          <AnimatePresence>
            {eduExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2 mt-2 pt-1"
              >
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="text-[11px] text-zinc-400 leading-snug border-l border-white/10 pl-2">
                    {edu}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Projects - Collapsible */}
      {resumeData.projects && resumeData.projects.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4">
          <button
            onClick={() => setProjExpanded(!projExpanded)}
            className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <span className="flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 text-accent" />
              <span>Key Projects</span>
            </span>
            <ChevronRight className={`h-3.5 w-3.5 transform transition-transform duration-200 ${projExpanded ? "rotate-90" : ""}`} />
          </button>
          
          <AnimatePresence>
            {projExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2 mt-2 pt-1"
              >
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="text-[11px] text-zinc-400 leading-relaxed border-l border-white/10 pl-2 bg-white/[0.01] p-1.5 rounded">
                    {proj}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
