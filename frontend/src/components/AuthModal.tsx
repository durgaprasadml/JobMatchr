"use client";

import React, { useState } from "react";
import { X, Mail, Lock, Sparkles, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, token: string, isPremium: boolean) => void;
  apiUrl: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, apiUrl }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? "/auth/register" : "/auth/login";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (isSignUp) {
        // Auto login on successful register
        const loginResponse = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResponse.json();
        onSuccess(email, loginData.access_token, loginData.is_premium || false);
      } else {
        onSuccess(email, data.access_token, data.is_premium || false);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Simulate successful Google Sign-in
    setTimeout(async () => {
      try {
        // Register/Login mock user in backend
        const mockEmail = "google.candidate@jobmatchr.io";
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: mockEmail, password: "GoogleOAuthSimulatedPassword123!" }),
        });
        
        // Ignore error if already exists, just log in
        const loginResponse = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: mockEmail, password: "GoogleOAuthSimulatedPassword123!" }),
        });
        const loginData = await loginResponse.json();
        
        onSuccess(mockEmail, loginData.access_token, loginData.is_premium || false);
        onClose();
      } catch (err) {
        // Fallback directly if connection fails
        onSuccess("google.candidate@jobmatchr.io", "mock_token", false);
        onClose();
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-card-border glass-panel p-6 shadow-2xl z-10"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-muted-bg hover:text-foreground transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-secondary text-white shadow-lg shadow-accent/20 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                {isSignUp ? "Discover matching jobs in seconds" : "Log in to track your matches"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 p-3 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-card-border bg-muted-bg/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-card-border bg-muted-bg/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-secondary py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
              >
                {loading ? "Authenticating..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>

            <div className="my-5 flex items-center justify-between text-xs text-muted">
              <span className="h-px w-full bg-card-border" />
              <span className="px-3 shrink-0">or continue with</span>
              <span className="h-px w-full bg-card-border" />
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-card-border bg-muted-bg py-2.5 text-sm font-semibold hover:bg-card-border transition-all duration-200"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Switch Mode */}
            <p className="mt-6 text-center text-xs text-muted">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-bold text-accent hover:underline"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
