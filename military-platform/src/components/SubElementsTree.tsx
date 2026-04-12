"use client";

import { ChevronLeft } from "lucide-react";

interface SubElementsTreeProps {
  data: string;
}

function parseElements(text: string): string[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/[،,\n\r•\-\/\\|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SubElementsTree({ data }: SubElementsTreeProps) {
  const elements = parseElements(data);

  if (elements.length === 0) {
    return <p className="text-sm text-text-muted">لا توجد بيانات</p>;
  }

  return (
    <div className="space-y-1">
      {elements.map((el, i) => (
        <div
          key={i}
          className="flex items-center gap-2 pr-3 py-2 rounded-lg hover:bg-glass transition-colors"
        >
          <div className="w-6 h-6 rounded-md bg-accent2-soft flex items-center justify-center shrink-0">
            <ChevronLeft size={12} className="text-accent2" />
          </div>
          <span className="text-sm text-text">{el}</span>
        </div>
      ))}
    </div>
  );
}
