"use client";

import React, { useState } from "react";
import { Filter, Search, MapPin, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterState {
  q: string;
  location: string;
  job_type: string;
  workplace_type: string;
  experience_level: string;
  role_category: string;
  company_type: string;
}

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarFilters({
  filters,
  onChange,
  onClear,
  isOpen = false,
  onClose,
}: SidebarFiltersProps) {
  
  // Track which categories are collapsed
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    "Workplace": false,
    "Job Type": false,
    "Experience Level": false,
    "Role Category": true, // Default collapse less common ones for high density
    "Company Type": true,
  });

  const toggleCollapse = (title: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleInputChange = (field: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const categories = [
    {
      title: "Workplace",
      field: "workplace_type" as keyof FilterState,
      options: ["Remote", "On-site", "Hybrid"],
    },
    {
      title: "Job Type",
      field: "job_type" as keyof FilterState,
      options: ["Full-time", "Internship", "Part-time"],
    },
    {
      title: "Experience Level",
      field: "experience_level" as keyof FilterState,
      options: ["Entry", "Mid", "Senior"],
    },
    {
      title: "Role Category",
      field: "role_category" as keyof FilterState,
      options: ["Engineering", "Design", "Product", "Marketing"],
    },
    {
      title: "Company Type",
      field: "company_type" as keyof FilterState,
      options: ["Startup", "Corporate"],
    },
  ];

  const content = (
    <div className="flex flex-col gap-5">
      {/* Search inputs */}
      <div className="space-y-2.5">
        <div className="relative group">
          <Search className="absolute top-3 left-3 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-accent transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={filters.q}
            onChange={(e) => handleInputChange("q", e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#111118]/30 py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-accent/50 focus:bg-[#111118]/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
          />
        </div>
        <div className="relative group">
          <MapPin className="absolute top-3 left-3 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-accent transition-colors duration-200" />
          <input
            type="text"
            placeholder="Filter location..."
            value={filters.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#111118]/30 py-2.5 pl-9 pr-4 text-xs text-white outline-none focus:border-accent/50 focus:bg-[#111118]/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Select options with animated expand/collapse */}
      {categories.map((cat) => {
        const isCollapsed = collapsed[cat.title];
        const isCategoryActive = !!filters[cat.field];

        return (
          <div key={cat.title} className="border-t border-white/[0.06] pt-3.5">
            <button
              onClick={() => toggleCollapse(cat.title)}
              className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors duration-200 group"
            >
              <div className="flex items-center gap-1.5">
                <span>{cat.title}</span>
                {isCategoryActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {isCategoryActive && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInputChange(cat.field, "");
                    }}
                    className="text-[9px] text-accent hover:underline lowercase normal-case font-bold px-1"
                  >
                    reset
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 text-zinc-500 group-hover:text-white transition-transform duration-250 ${isCollapsed ? "-rotate-90" : ""}`} />
              </div>
            </button>
            
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {cat.options.map((opt) => {
                      const active = filters[cat.field] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleInputChange(cat.field, active ? "" : opt)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all duration-150 ${
                            active
                              ? "bg-accent/10 text-accent border-accent/30 shadow-inner"
                              : "bg-[#111118]/40 text-zinc-300 border-white/[0.06] hover:bg-[#111118] hover:border-zinc-700"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Reset button */}
      <button
        onClick={onClear}
        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#111118] hover:bg-[#181824] hover:border-zinc-700 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-all duration-200"
      >
        Clear Workspace Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer view */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-md md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div
          className={`absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#0B0B0F] border-r border-white/[0.08] p-6 overflow-y-auto transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-accent" />
              <span className="font-extrabold text-sm uppercase tracking-wider text-white">Filters</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-[#111118] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block w-72 shrink-0 rounded-2xl border border-white/[0.08] bg-[#0B0B0F] p-5 sticky top-24 self-start shadow-xl">
        <div className="flex items-center gap-1.5 mb-5 border-b border-white/[0.06] pb-3">
          <Filter className="h-3.5 w-3.5 text-accent" />
          <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Workspace Filters</span>
        </div>
        {content}
      </div>
    </>
  );
}
