"use client";

import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-accent-light transition-colors"
      >
        <Home size={14} />
        <span>الرئيسية</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronLeft size={14} className="opacity-40" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-accent-light transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
