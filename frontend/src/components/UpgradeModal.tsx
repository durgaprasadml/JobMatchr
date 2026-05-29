"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Check, Sparkles, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Fallback bounds checking for clicking the backdrop to close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);

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
    setTimeout(() => {
      setLoading(false);
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  const features = [
    "Verify compatibility for all 100+ matching roles",
    "Detailed ATS compliance metrics and scoring reports",
    "Tailored cover letter and resume bullet generator",
    "Interactive skill gap analysis with study resource suggestions",
    "Custom job listing alerts via dashboard feeds",
    "Deep AI match reasonings & contextual highlights"
  ];

  return (
    <dialog
      ref={dialogRef}
      // @ts-ignore
      closedby="any"
      aria-labelledby="upgradeTitle"
      className="m-auto w-full max-w-lg rounded-2xl border border-white/[0.08] glass-panel shadow-2xl overflow-hidden outline-none bg-[#0B0B0F] backdrop:backdrop-blur-md backdrop:bg-black/80"
    >
      <div className="relative p-6 sm:p-8">
        
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-accent/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={() => dialogRef.current?.close()}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-[#111118] hover:text-white transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Badge */}
        <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3.5 py-1 text-[10px] font-black tracking-widest text-accent uppercase">
          <Sparkles className="h-3 w-3 fill-accent" />
          <span>System Premium Access</span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 id="upgradeTitle" className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            Unlock Match Intelligence
          </h2>
          <p className="mt-2 text-xs text-zinc-400 font-semibold max-w-sm mx-auto leading-relaxed">
            Gain unlimited access to live job matching, ATS compliance scoring, and detailed skill gap indexes.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center rounded-xl bg-[#111118] border border-white/[0.08] p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-lg px-4 py-1.5 text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-[#0B0B0F] text-white shadow-md border border-white/[0.04]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-accent to-accent-secondary text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Yearly access</span>
              <span className="rounded bg-white/20 px-1.5 py-0.2 text-[8px] text-white font-extrabold uppercase">Save 30%</span>
            </button>
          </div>
        </div>

        {/* Big Price Card */}
        <div className="rounded-2xl bg-[#111118]/50 border border-white/[0.08] p-5 text-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-16 bg-accent-secondary/5 blur-xl pointer-events-none rounded-full" />
          <div className="flex items-baseline justify-center gap-1 text-white z-10 relative">
            <span className="text-4xl sm:text-5xl font-black tracking-tighter">
              {billingPeriod === "yearly" ? "$12" : "$19"}
            </span>
            <span className="text-xs font-semibold text-zinc-500">/ month</span>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-400 font-semibold z-10 relative">
            {billingPeriod === "yearly"
              ? "Billed annually ($144). Cancel subscription anytime."
              : "Billed monthly. Cancel subscription anytime."}
          </p>
        </div>

        {/* Feature List Checklist */}
        <div className="space-y-3.5 mb-7 border-t border-white/[0.06] pt-5">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Included Credentials</p>
          <div className="grid grid-cols-1 gap-2.5">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <Check className="h-3 w-3" />
                </span>
                <span className="font-semibold leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-accent/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          <Zap className="h-4 w-4 fill-white" />
          <span>{loading ? "Initializing Checkout Session..." : "Unlock Dashboard"}</span>
        </button>

        {/* Security badge overlay */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Fully encrypted transactions. Secure Stripe Checkout.</span>
        </div>
      </div>
    </dialog>
  );
}
