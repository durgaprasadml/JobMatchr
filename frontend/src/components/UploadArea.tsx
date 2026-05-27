"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle, ShieldAlert, AlertCircle } from "lucide-react";

interface UploadAreaProps {
  onUploadSuccess: (sessionId: string, resumeData: any) => void;
  apiUrl: string;
}

export default function UploadArea({ onUploadSuccess, apiUrl }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Uploading resume...");
  const [error, setError] = useState<string | null>(null);

  const simulateProgress = (onFinish: () => void) => {
    setProgress(0);
    setStatusMessage("Uploading resume...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next < 20) {
          setStatusMessage("Reading document structure...");
        } else if (next < 40) {
          setStatusMessage("Extracting skills & experience...");
        } else if (next < 60) {
          setStatusMessage("Searching live Indian jobs...");
        } else if (next < 80) {
          setStatusMessage("Calculating AI match scores...");
        } else {
          setStatusMessage("Finalizing ATS report...");
        }
        return next;
      });
    }, 300);

    return () => {
      clearInterval(interval);
      onFinish();
    };
  };

  const uploadFile = async (file: File) => {
    // Validate type
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setError("Supported file types are PDF and DOCX only.");
      return;
    }

    setError(null);
    setLoading(true);

    let apiCompleted = false;
    const cleanup = simulateProgress(() => {
      setProgress(100);
      setStatusMessage("Analysis complete!");
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

      // Finish progress animation
      apiCompleted = true;
      setProgress(100);
      setStatusMessage("Analysis complete!");
      
      // Delay success trigger slightly for visual pacing
      setTimeout(() => {
        onUploadSuccess(result.session_id, result.data);
      }, 500);
      
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

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!loading ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-card-border bg-card/40 hover:bg-card-border/10 hover:border-accent/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20 mb-4 shadow-inner shadow-accent/5">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-center">
            Upload your resume
          </h3>
          <p className="mt-1 text-sm text-muted text-center max-w-sm">
            Drag and drop your file here, or click to browse. Supports PDF & DOCX formats.
          </p>

          {/* Privacy Disclaimer */}
          <div className="mt-6 flex items-center gap-1.5 rounded-full bg-muted-bg px-4 py-1 text-xs border border-card-border text-muted">
            <CheckCircle className="h-3.5 w-3.5 text-success" />
            <span>Your resume is processed securely and never permanently stored.</span>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 p-3 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* Premium AI Scanning Progress Screen */
        <div className="rounded-2xl border border-card-border glass-panel p-8 sm:p-12 text-center relative overflow-hidden animate-scan">
          {/* Accent secondary glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-secondary/10 blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Spinning scanner icon */}
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent-secondary text-white shadow-xl shadow-accent/20">
              <FileText className="h-8 w-8 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-white/20 animate-ping" />
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">
              {statusMessage}
            </h3>
            
            {/* Progress Bar Container */}
            <div className="mt-6 w-full max-w-md rounded-full bg-muted-bg border border-card-border p-1 shadow-inner">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-accent to-accent-secondary shadow-lg shadow-accent/40 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <span className="mt-2 text-sm font-extrabold text-accent">
              {progress}%
            </span>
            
            <p className="mt-4 text-xs text-muted max-w-xs leading-relaxed">
              Our advanced AI parser is parsing document structures, matching skills, and analyzing job fit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
