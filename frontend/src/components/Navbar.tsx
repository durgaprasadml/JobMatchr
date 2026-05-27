"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Sun, Moon, LogIn, LogOut, Briefcase, RefreshCw } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  userEmail: string | null;
  isPremium: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  sessionId: string | null;
  onRescan: () => void;
}

export default function Navbar({
  userEmail,
  isPremium,
  onOpenAuth,
  onLogout,
  sessionId,
  onRescan,
}: NavbarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Read saved theme if any
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setTheme("light");
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border glass-panel transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-secondary text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-5 w-5" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent">
            JobMatchr
          </span>
        </Link>

        {/* Action Items */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-sm font-medium hover:text-accent transition-colors duration-200"
          >
            Dashboard
          </Link>
          
          {/* Active resume reset button */}
          {sessionId && (
            <button
              onClick={onRescan}
              className="flex items-center gap-1.5 rounded-lg bg-muted-bg px-3 py-1.5 text-xs font-semibold border border-card-border hover:bg-card-border transition-colors duration-200"
              title="Rescan another resume"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">New Upload</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted-bg border border-card-border text-foreground hover:bg-card-border transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </button>

          {/* User Section / Auth */}
          {userEmail ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden md:flex">
                <span className="text-xs font-semibold truncate max-w-[120px]">{userEmail}</span>
                {isPremium ? (
                  <span className="inline-flex items-center justify-end gap-1 text-[10px] font-extrabold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider self-end mt-0.5">
                    <Sparkles className="h-2.5 w-2.5 fill-accent" /> Premium
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Free Member</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 text-sm font-semibold hover:bg-destructive/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent-secondary text-white shadow-md shadow-accent/10 px-4 py-1.5 text-sm font-semibold hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
