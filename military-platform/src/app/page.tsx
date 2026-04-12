"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MILITARY_PATHS } from "@/lib/paths-config";

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? MILITARY_PATHS.filter(
        (p) =>
          p.name.includes(search) ||
          p.subtitle.includes(search)
      )
    : MILITARY_PATHS;

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-start px-5 py-3.5 border-b border-line bg-[rgba(15,23,42,0.75)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-[14px] grid place-items-center font-black text-white bg-gradient-to-br from-accent to-accent2 text-sm">
            FCD
          </div>
          <div>
            <div className="text-lg font-black text-text">موسوعة القدرات</div>
            <div className="text-xs text-text-muted mt-0.5">اختر مساراً للبدء</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-4 py-5 pb-12">
        {/* Hero */}
        <section className="text-center py-8 px-2.5">
          <h1 className="text-[34px] font-black m-0">10 مسارات عسكرية</h1>
          <p className="mt-3 text-text-muted leading-relaxed">
            اختر أحد المسارات للدخول إلى التفاصيل.
          </p>

          <div className="mt-5 mx-auto flex gap-2.5 w-[min(650px,100%)] p-2.5 rounded-full border border-line bg-glass">
            <input
              type="search"
              placeholder="ابحث عن مسار…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-text px-3 py-2 text-sm placeholder:text-[rgba(241,245,249,0.55)]"
            />
            <button
              type="button"
              className="border border-accent bg-accent-soft text-text px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-accent text-sm"
            >
              بحث
            </button>
          </div>
        </section>

        {/* Grid */}
        <section className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {filtered.map((path) => (
            <Link
              key={path.name}
              href={`/path/${encodeURIComponent(path.name)}`}
              className="group relative rounded-[18px] overflow-hidden border border-line bg-bg-soft shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-light hover:shadow-[0_20px_60px_rgba(37,99,235,0.25)]"
            >
              <Image
                src={path.image}
                alt={`مسار ${path.name}`}
                width={400}
                height={240}
                className="w-full h-[240px] object-cover scale-[1.02]"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,23,42,0.15)] via-[rgba(15,23,42,0.70)] to-[rgba(15,23,42,0.95)]" />
              <div className="absolute inset-0 bg-[radial-gradient(400px_200px_at_70%_10%,rgba(37,99,235,0.25),transparent_60%)]" />

              {/* Content */}
              <div className="absolute bottom-4 right-[18px] flex flex-col gap-1.5">
                <div className="text-lg font-black text-text">{path.name}</div>
                <div className="text-xs text-[rgba(241,245,249,0.75)]">
                  {path.capabilityCount} قدرة &bull; {path.subtitle}
                </div>
              </div>

              {/* Shine */}
              <div className="absolute inset-[-40%] bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,0.08)_48%,transparent_60%)] translate-x-[120%] rotate-[10deg] transition-transform duration-600 group-hover:translate-x-[-20%]" />
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-[1240px] mx-auto mb-5 px-4 text-center text-[rgba(241,245,249,0.55)] text-xs">
        © موسوعة القدرات
      </footer>
    </div>
  );
}
