"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterOptions {
  paths: string[];
  capabilities: string[];
  types: string[];
  subCapabilities: string[];
}

interface FilterPanelProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [options, setOptions] = useState<FilterOptions>({
    paths: [],
    capabilities: [],
    types: [],
    subCapabilities: [],
  });
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/data?action=filters")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOptions(data);
        }
      });
  }, []);

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <SlidersHorizontal size={18} />
          <span>الفلاتر</span>
        </div>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
          >
            <RotateCcw size={14} />
            إعادة تعيين
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="المسار"
          value={filters.path || ""}
          options={options.paths}
          onChange={(v) => updateFilter("path", v)}
        />
        <Select
          label="القدرة"
          value={filters.capability || ""}
          options={options.capabilities}
          onChange={(v) => updateFilter("capability", v)}
        />
        <Select
          label="النوع"
          value={filters.type || ""}
          options={options.types}
          onChange={(v) => updateFilter("type", v)}
        />
        <Select
          label="القدرة الفرعية"
          value={filters.sub_capability || ""}
          options={options.subCapabilities}
          onChange={(v) => updateFilter("sub_capability", v)}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
      >
        <option value="">الكل</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
