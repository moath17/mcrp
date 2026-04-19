"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Upload,
  ScrollText,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { MILITARY_PATHS } from "@/lib/paths-config";

const utilityItems = [
  { href: "/search", label: "البحث الذكي", icon: Search },
  { href: "/upload", label: "رفع البيانات", icon: Upload },
  { href: "/logs", label: "سجل العمليات", icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentPathSlug = decodeURIComponent(
    pathname.split("/path/")[1]?.split("/")[0] || ""
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden bg-bg-soft text-text p-2 rounded-lg shadow-lg border border-line"
        aria-label="القائمة"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-bg-soft border-l border-line text-text z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-line">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 left-4 md:hidden text-text-muted hover:text-text"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/MNGDP LOGO 2 .png"
              alt="شعار برنامج تطوير وزارة الحرس الوطني"
              width={160}
              height={48}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="mt-3">
            <h1 className="font-bold text-sm leading-tight text-text">موسوعة القدرات</h1>
            <p className="text-[11px] text-text-muted">القدرات العسكرية</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Home */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all text-text-muted hover:bg-glass hover:text-text"
          >
            <Home size={18} />
            <span>الرئيسية</span>
          </Link>

          {/* Separator */}
          <div className="pt-3 pb-1 px-4">
            <span className="text-[11px] font-medium text-text-muted/60 uppercase tracking-wider">المسارات</span>
          </div>

          {/* Paths */}
          {MILITARY_PATHS.map((path) => {
            const isActive = currentPathSlug === path.name;
            return (
              <Link
                key={path.name}
                href={`/path/${encodeURIComponent(path.name)}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-accent-soft text-accent-light font-medium border border-accent/20"
                    : "text-text-muted hover:bg-glass hover:text-text"
                }`}
              >
                <ChevronLeft size={14} className="opacity-50" />
                <span>{path.name}</span>
              </Link>
            );
          })}

          {/* Separator */}
          <div className="pt-4 pb-1 px-4">
            <span className="text-[11px] font-medium text-text-muted/60 uppercase tracking-wider">أدوات</span>
          </div>

          {/* Utility items */}
          {utilityItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-accent-soft text-accent-light font-medium border border-accent/20"
                    : "text-text-muted hover:bg-glass hover:text-text"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="text-[11px] text-text-muted/40 text-center">
            منصة داخلية — بدون اتصال
          </div>
        </div>
      </aside>
    </>
  );
}
