"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sparkles, FileText, CheckCircle, BarChart2, ShieldAlert, Award, Star, ListFilter, AlertCircle, RefreshCw } from "lucide-react";
import Navbar from "../../components/Navbar";
import UploadArea from "../../components/UploadArea";
import SidebarFilters from "../../components/SidebarFilters";
import JobCard from "../../components/JobCard";
import AuthModal from "../../components/AuthModal";
import UpgradeModal from "../../components/UpgradeModal";
import { useSearchParams } from "next/navigation";

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
  const [activeTab, setActiveTab] = useState<"matching" | "saved">("matching");

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
    
    // Resume session is stored in sessionStorage so it clears on tab/browser close
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

    // Auto open auth modal if ?auth=true is in URL
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
        // Use live JSearch matching pipeline
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
        // No resume — fetch seeded DB jobs as browse experience
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
    
    // Cache in session storage
    sessionStorage.setItem("resumeSessionId", sId);
    sessionStorage.setItem("resumeData", JSON.stringify(data));

    // Immediately trigger live job matching
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
    
    // Clear storage & state
    setSessionId(null);
    setResumeData(null);
    sessionStorage.removeItem("resumeSessionId");
    sessionStorage.removeItem("resumeData");
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
      // Prompt sign-in first if not logged in
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
        // Re-fetch jobs to unlock premium listings
        fetchJobs(sessionId, userEmail, filters);
      }
    } catch (err) {
      // Fail-safe fallback
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

  // Calculate locked job count
  const lockedCount = Math.max(0, jobs.length - 5);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-30" />

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
        
        {/* Step 2 — Upload area or ATS Score Banner */}
        {!sessionId ? (
          <div className="mb-10 max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Benchmark Your Resume Against Live Jobs
            </h1>
            <p className="text-sm text-muted max-w-lg mx-auto">
              Upload your resume to calculate instant AI match percentages, unlock ATS reports, and detect skill gaps.
            </p>
            <UploadArea onUploadSuccess={handleUploadSuccess} apiUrl={API_URL} />
          </div>
        ) : (
          /* Premium Scan Result Header with ATS score */
          <div className="space-y-6 mb-10">
            {/* Main Header Card */}
            <div className="rounded-2xl border border-card-border glass-panel p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-32 bg-accent/5 blur-3xl pointer-events-none rounded-full" />
              
              <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative z-10">
                
                {/* Profile Details */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-lg bg-accent/15 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
                      ATS Score Profile
                    </div>
                    <button
                      onClick={handleRescan}
                      className="flex items-center gap-1 text-xs text-muted hover:text-foreground font-semibold"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Rescan another resume</span>
                    </button>
                  </div>
                  
                  <div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                      {resumeData?.full_name || "Extracted Profile"}
                    </h2>
                    <p className="text-xs text-muted mt-1 font-semibold">
                      Suggested Roles: {resumeData?.suggested_roles?.join(", ") || "Full Stack Developer"}
                    </p>
                    <p className="text-xs text-muted mt-0.5 font-semibold">
                      Experience: {resumeData?.experience_level} ({resumeData?.years_of_experience} {resumeData?.years_of_experience === 1 ? 'Year' : 'Years'})
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {resumeData?.technical_skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-muted-bg border border-card-border/80 px-2 py-0.5 text-[11px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Soft Skills</p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {resumeData?.soft_skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-muted-bg border border-card-border/80 px-2 py-0.5 text-[11px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS score indicator & Career Insights */}
                <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-card-border/80 pt-6 lg:pt-0 lg:pl-8">
                  
                  {/* Dial indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-muted-bg shadow-inner">
                      <svg className="absolute inset-0 h-full w-full -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          className="stroke-transparent fill-transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          className="fill-transparent stroke-accent transition-all duration-1000"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - (resumeData?.ats_score || 80) / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-2xl font-black">{resumeData?.ats_score || 80}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mt-2">ATS Score</span>
                  </div>

                  {/* Suggestions / Insights */}
                  <div className="flex-1 space-y-3 max-w-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                      <Sparkles className="h-4 w-4 fill-success/20 text-success" />
                      <span>Strong Candidate Areas</span>
                    </div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-2">
                      {resumeData?.strong_areas?.slice(0, 3).map((strong, idx) => (
                        <div key={idx} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                          <span className="text-success font-bold">•</span>
                          <span>{strong}</span>
                        </div>
                      ))}
                    </div>
                  </div>

              </div>
            </div>
          </div>

            {/* Profile Supplementary Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Summary Card */}
              <div className="lg:col-span-2 rounded-2xl border border-card-border bg-card/30 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-accent" />
                    <span>Resume Executive Summary</span>
                  </h3>
                  <p className="text-xs leading-relaxed text-foreground/85">
                    {resumeData?.resume_summary || "No executive summary parsed."}
                  </p>
                </div>
              </div>

              {/* Stats / Other elements card */}
              <div className="rounded-2xl border border-card-border bg-card/30 p-6 space-y-4">
                {/* Education */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Education</h3>
                  <div className="space-y-1.5">
                    {resumeData?.education?.map((edu, idx) => (
                      <p key={idx} className="text-xs text-foreground/80 font-semibold">• {edu}</p>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {resumeData?.certifications && resumeData.certifications.length > 0 && (
                  <div className="border-t border-card-border/60 pt-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Certifications</h3>
                    <div className="space-y-1">
                      {resumeData?.certifications?.map((cert, idx) => (
                        <p key={idx} className="text-xs text-foreground/80 font-semibold">• {cert}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Projects Card - full width below */}
              {resumeData?.projects && resumeData.projects.length > 0 && (
                <div className="lg:col-span-3 rounded-2xl border border-card-border bg-card/30 p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-accent" />
                    <span>Highlighted Projects</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData?.projects?.map((proj, idx) => (
                      <div key={idx} className="rounded-xl border border-card-border/60 bg-muted-bg/30 p-4 text-xs leading-relaxed text-foreground/80">
                        {proj}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard workspace grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <SidebarFilters
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          />

          {/* Main Listings Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-card-border/60 pb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("matching")}
                  className={`relative pb-4 text-sm font-bold transition-all duration-200 ${
                    activeTab === "matching"
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>AI Matches</span>
                  {sessionId && (
                    <span className="ml-1.5 rounded-full bg-accent/15 border border-accent/20 px-1.5 py-0.2 text-[10px] font-extrabold text-accent">
                      {jobs.length}
                    </span>
                  )}
                  {activeTab === "matching" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
                
                {userEmail && (
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={`relative pb-4 text-sm font-bold transition-all duration-200 ${
                      activeTab === "saved"
                        ? "text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span>Saved Jobs</span>
                    <span className="ml-1.5 rounded-full bg-muted-bg border border-card-border px-1.5 py-0.2 text-[10px] font-extrabold text-muted">
                      {savedJobs.length}
                    </span>
                    {activeTab === "saved" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                    )}
                  </button>
                )}
              </div>

              {/* Mobile Filter toggle button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-card-border bg-muted-bg px-3.5 py-2 text-xs font-bold md:hidden"
              >
                <ListFilter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Content Switch */}
            {activeTab === "matching" ? (
              
              /* Skeletons/Jobs List */
              loadingJobs ? (
                <div className="grid grid-cols-1 gap-4">
                  {/* Live matching banner during first load with a session */}
                  {matchingLive && (
                    <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent-secondary/5 p-5 flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-foreground">Searching Live Indian Jobs...</p>
                        <p className="text-xs text-muted">AI is matching your resume against real-time openings on JSearch API</p>
                      </div>
                    </div>
                  )}
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="rounded-2xl border border-card-border bg-card/40 p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-card-border/50 shimmer-bg" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-1/3 rounded bg-card-border/50 shimmer-bg" />
                          <div className="h-3 w-1/4 rounded bg-card-border/30" />
                        </div>
                      </div>
                      <div className="h-3 w-full rounded bg-card-border/30 shimmer-bg" />
                      <div className="h-3 w-5/6 rounded bg-card-border/30 shimmer-bg" />
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded bg-card-border/40 shimmer-bg" />
                        <div className="h-6 w-16 rounded bg-card-border/40 shimmer-bg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                /* Empty state */
                <div className="rounded-2xl border border-card-border bg-card/25 p-12 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted mb-4" />
                  <h3 className="text-base font-extrabold">No job matches found</h3>
                  <p className="mt-1.5 text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    {sessionId
                      ? "No live jobs found for your profile right now. Try uploading a different resume or check back later."
                      : "We couldn't find any job matches that fit your filters. Try adjusting your sidebar tags or uploading a resume."}
                  </p>
                </div>
              ) : (
                /* Job Cards List */
                <div className="space-y-4">
                  {/* Live jobs indicator badge */}
                  {sessionId && (
                    <div className="flex items-center gap-2 text-xs text-muted font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      <span>Showing {jobs.length} live Indian jobs matched to your resume</span>
                    </div>
                  )}
                  {/* Freemium Unlock prompt banner at top of jobs list if non-premium and has locked jobs */}
                  {!isPremium && lockedCount > 0 && (
                    <div className="rounded-xl bg-gradient-to-r from-accent/10 via-accent-secondary/5 to-transparent border border-accent/15 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold tracking-tight">
                          Unlock {lockedCount} more matching jobs with Premium
                        </p>
                        <p className="text-xs text-muted font-semibold">
                          View full descriptions, ATS details, custom application advices, and apply portals.
                        </p>
                      </div>
                      <button
                        onClick={() => setUpgradeModalOpen(true)}
                        className="rounded-lg bg-gradient-to-r from-accent to-accent-secondary px-4 py-2 text-xs font-bold text-white shadow-md shadow-accent/25 hover:brightness-110 shrink-0"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job, idx) => (
                      <JobCard
                        key={job.id ?? `${job.title}-${job.company_name}-${idx}`}
                        job={job}
                        hasResume={!!sessionId}
                        onOpenUpgrade={() => setUpgradeModalOpen(true)}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              /* Saved Jobs Tab */
              savedJobs.length === 0 ? (
                <div className="rounded-2xl border border-card-border bg-card/25 p-12 text-center">
                  <Star className="mx-auto h-10 w-10 text-muted mb-4" />
                  <h3 className="text-base font-extrabold">No saved jobs yet</h3>
                  <p className="mt-1.5 text-xs text-muted max-w-sm mx-auto leading-relaxed">
                    Click "Apply" or save jobs to organize your application flow.
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
              )
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-card-border/40 bg-[#070708] py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted font-semibold">
          <span>JobMatchr © 2026. Secure session-based processing.</span>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
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
