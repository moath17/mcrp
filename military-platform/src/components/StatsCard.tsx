"use client";

import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold text-primary">{value}</p>
          {description && <p className="text-xs text-muted mt-2">{description}</p>}
        </div>
        <div className="w-11 h-11 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon size={22} className="text-primary" />
        </div>
      </div>
    </div>
  );
}
