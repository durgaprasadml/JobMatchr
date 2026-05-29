"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle, ShieldAlert, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadAreaProps {
  onUploadSuccess: (sessionId: string, resumeData: any) => void;
  apiUrl: string;
}

export default function UploadArea({ onUploadSuccess, apiUrl }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Extracting Skills...");
  const [error, setError] = useState<string | null>(null);

  const simulateProgress = (onFinish: () => void) => {
    setProgress(0);
    setStatusMessage("Extracting Skills...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        
        const next = prev + Math.floor(Math.random() * 10) + 4;
        if (next < 25) {
          setStatusMessage("Extracting Skills...");
        } else if (next < 50) {
          setStatusMessage("Understanding Experience...");
        } else if (next < 75) {
          setStatusMessage("Matching Live Jobs...");
        } else {
          setStatusMessage("Ranking Opportunities...");
        }
        return next;
      });
    }, 250);

    return () => {
      clearInterval(interval);
      onFinish();
    };
  };

  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setError("Supported formats are PDF and DOCX only.");
      return;
    }

    setError(null);
    setLoading(true);

    let apiCompleted = false;
    const cleanup = simulateProgress(() => {
      setProgress(100);
      setStatusMessage("Optimization Complete!");
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/resume/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Error scanning resume");
      }

      apiCompleted = true;
      setProgress(100);
      setStatusMessage("Optimization Complete!");
      
      setTimeout(() => {
        onUploadSuccess(result.session_id, result.data);
      }, 600);
      
    } catch (err: any) {
      setError(err.message || "Failed to process resume. Please try again.");
      setLoading(false);
    } finally {
      cleanup();
      if (!apiCompleted) {
        setLoading(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 sm:p-12 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              dragActive
                ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                : "border-white/[0.08] bg-[#0B0B0F] hover:bg-[#111118]/80 hover:border-accent/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Accent light highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-accent/5 blur-2xl pointer-events-none rounded-full" />

            <motion.div 
              animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.02] text-accent border border-white/[0.08] mb-5 shadow-inner transition-colors group-hover:border-accent/30 group-hover:text-accent-secondary"
            >
              <UploadCloud className="h-6 w-6" />
            </motion.div>

            <h3 className="text-sm font-bold text-white tracking-tight">
              Upload Resume
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 text-center max-w-sm leading-relaxed">
              Drag and drop your file here, or click to browse. <br/>Supports PDF and DOCX formats.
            </p>

            {/* Privacy indicator */}
            <div className="mt-6 flex items-center gap-1.5 rounded-full bg-[#111118] px-3.5 py-1 text-[10px] font-bold border border-white/[0.06] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Resume is temporarily processed and never stored.</span>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 p-3 text-xs"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Premium AI Scanning Progress Screen */
          <motion.div
            key="loading-zone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-8 sm:p-12 text-center relative overflow-hidden animate-scan shadow-2xl"
          >
            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent-secondary/5 blur-3xl pointer-events-none rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center">
              
              <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-secondary text-white shadow-xl shadow-accent/20">
                <FileText className="h-7 w-7 animate-pulse" />
                <div className="absolute inset-0 rounded-xl border border-white/20 animate-ping opacity-60" />
              </div>

              <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-accent bg-accent/15 border border-accent/25 px-2.5 py-0.5 rounded-full uppercase mb-2">
                <Sparkles className="h-3 w-3 fill-accent" /> MATCH ENGINE ACTIVATED
              </span>

              <h3 className="text-base font-extrabold tracking-tight text-white h-6">
                {statusMessage}
              </h3>
              
              {/* Progress Bar Container */}
              <div className="mt-6 w-full max-w-xs rounded-full bg-white/[0.02] border border-white/[0.06] p-1 shadow-inner">
                <motion.div
                  className="h-1.5 rounded-full bg-gradient-to-r from-accent via-accent to-accent-secondary shadow-md shadow-accent/40"
                  style={{ width: `${progress}%` }}
                  layoutId="progress-bar"
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
              </div>
              
              <span className="mt-2 text-[10px] font-black text-accent">
                {progress}%
              </span>
              
              <p className="mt-4 text-[10px] text-zinc-500 max-w-xs leading-relaxed font-semibold">
                Parsing schemas, extracting technical skills, identifying experience tags, and searching open matching roles...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
