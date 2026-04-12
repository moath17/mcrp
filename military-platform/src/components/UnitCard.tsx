"use client";

import { Building2 } from "lucide-react";

interface UnitCardProps {
  data: string;
}

function parseUnits(text: string): string[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/[،,\n\r•\-|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function UnitCard({ data }: UnitCardProps) {
  const units = parseUnits(data);

  if (units.length === 0) {
    return <p className="text-sm text-text-muted">لا توجد بيانات</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {units.map((unit, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-bg-card/60 border border-line hover:border-accent2/30 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-accent2-soft flex items-center justify-center mb-3">
            <Building2 size={20} className="text-accent2" />
          </div>
          <div className="text-sm font-bold text-text">{unit}</div>
        </div>
      ))}
    </div>
  );
}
