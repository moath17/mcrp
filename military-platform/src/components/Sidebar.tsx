"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Database,
  GitCompareArrows,
  Upload,
  ScrollText,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "لوحة المعلومات", icon: LayoutDashboard },
  { href: "/search", label: "البحث الذكي", icon: Search },
  { href: "/browse", label: "تصفح البيانات", icon: Database },
  { href: "/compare", label: "المقارنات", icon: GitCompareArrows },
  { href: "/upload", label: "رفع البيانات", icon: Upload },
  { href: "/logs", label: "سجل العمليات", icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg shadow-lg"
        aria-label="القائمة"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-primary text-white z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 left-4 md:hidden text-white/70 hover:text-white"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-secondary" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">منصة بحث</h1>
              <p className="text-[11px] text-white/60">القدرات العسكرية</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-[11px] text-white/40 text-center">
            منصة داخلية — بدون اتصال
          </div>
        </div>
      </aside>
    </>
  );
}
