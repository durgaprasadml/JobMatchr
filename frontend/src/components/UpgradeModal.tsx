"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Check, Sparkles, Shield, Zap, Lock } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  // Sync open/close state of native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Fallback for browsers without closedby support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Listen to native dialog closing to notify parent component
    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);

    // Fallback bounds checking for clicking the backdrop
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isDialogContent) {
        dialog.close();
      }
    };

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  const handleUpgrade = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  const features = [
    "Unlimited AI job matching (no limits)",
    "Unlock all 100+ matched jobs (no blurring)",
    "AI resume optimization & tailorship suggestions",
    "Comprehensive ATS score analysis",
    "Detailed skill-gap analysis (missing skills)",
    "Tailored cover letter & resume bullet generation",
    "Advanced career insights & smart job alerts"
  ];

  return (
    <dialog
      ref={dialogRef}
      // @ts-ignore - closedby is newly standard but TS might complain
      closedby="any"
      aria-labelledby="upgradeTitle"
      className="m-auto w-full max-w-xl rounded-2xl border border-card-border glass-panel shadow-2xl overflow-hidden outline-none bg-card backdrop:backdrop-blur-md backdrop:bg-black/60"
    >
      <div className="relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => dialogRef.current?.close()}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-muted-bg hover:text-foreground transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge & Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-accent/20 blur-3xl pointer-events-none rounded-full" />
        
        <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-bold text-accent">
          <Sparkles className="h-3.5 w-3.5 fill-accent" />
          <span>JOBSMATCHR PREMIUM</span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 id="upgradeTitle" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock All AI Job Matches
          </h2>
          <p className="mt-2 text-sm text-muted">
            Get instant access to unlimited resumes, ATS scores, and all matching jobs.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center rounded-lg bg-muted-bg border border-card-border p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-card text-foreground shadow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-accent to-accent-secondary text-white shadow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span>Yearly</span>
              <span className="rounded bg-white/20 px-1 py-0.2 text-[8px] text-white font-extrabold uppercase">Save 30%</span>
            </button>
          </div>
        </div>

        {/* Price Card */}
        <div className="rounded-xl bg-muted-bg/50 border border-card-border p-6 text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold">
              {billingPeriod === "yearly" ? "$12" : "$19"}
            </span>
            <span className="text-sm font-semibold text-muted">/ month</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {billingPeriod === "yearly"
              ? "Billed annually ($144). Cancel anytime."
              : "Billed monthly. Cancel anytime."}
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Features Included</p>
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary py-3 text-sm font-bold text-white shadow-xl shadow-accent/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all duration-200"
        >
          <Zap className="h-4 w-4 fill-white" />
          <span>{loading ? "Processing Secure Checkout..." : "Upgrade to Premium"}</span>
        </button>

        {/* Security disclaimer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <Shield className="h-3 w-3" />
          <span>Secure stripe checkout. 100% money back guarantee.</span>
        </div>
      </div>
    </dialog>
  );
}
