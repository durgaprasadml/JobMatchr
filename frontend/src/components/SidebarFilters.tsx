"use client";

import React from "react";
import { Filter, Search, MapPin, X } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      {/* Search inputs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search role, skills or company..."
            value={filters.q}
            onChange={(e) => handleInputChange("q", e.target.value)}
            className="w-full rounded-lg border border-card-border bg-muted-bg/30 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all duration-200"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Filter location (e.g. San Francisco)..."
            value={filters.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full rounded-lg border border-card-border bg-muted-bg/30 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Select options */}
      {categories.map((cat, idx) => (
        <div key={idx} className="border-t border-card-border/60 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center justify-between">
            <span>{cat.title}</span>
            {filters[cat.field] && (
              <button
                onClick={() => handleInputChange(cat.field, "")}
                className="text-[10px] text-accent hover:underline lowercase normal-case font-normal"
              >
                Clear
              </button>
            )}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {cat.options.map((opt) => {
              const active = filters[cat.field] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleInputChange(cat.field, active ? "" : opt)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? "bg-accent/15 text-accent border-accent/40"
                      : "bg-muted-bg/40 text-foreground/80 border-card-border hover:bg-card-border/35"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Reset button */}
      <button
        onClick={onClear}
        className="mt-2 w-full rounded-lg border border-card-border bg-muted-bg hover:bg-card-border py-2 text-xs font-bold text-muted hover:text-foreground transition-all duration-200"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer view */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div
          className={`absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-card border-r border-card-border p-6 overflow-y-auto transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-accent" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Filters</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted hover:bg-muted-bg hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block w-72 shrink-0 rounded-2xl border border-card-border glass-panel p-5 sticky top-24 self-start">
        <div className="flex items-center gap-1.5 mb-5">
          <Filter className="h-4 w-4 text-accent" />
          <span className="font-extrabold text-xs uppercase tracking-wider">Filters</span>
        </div>
        {content}
      </div>
    </>
  );
}
