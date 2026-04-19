"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers, Database, Search as SearchIcon, Scale, ArrowLeft } from "lucide-react";
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
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-line bg-[rgba(15,23,42,0.75)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Image
            src="/MNGDP LOGO 2 .png"
            alt="شعار برنامج تطوير وزارة الحرس الوطني"
            width={180}
            height={56}
            priority
            className="h-12 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <div className="text-lg font-black text-text">موسوعة القدرات</div>
          </div>
        </div>
        <Link
          href="/comparisons"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-accent-soft/40 text-sm text-accent-light font-medium hover:bg-accent-soft hover:border-accent transition-colors"
        >
          <Scale size={16} />
          صفحة المقارنات
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-4 py-5 pb-12">
        {/* Hero */}
        <section className="text-center py-10 px-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent-soft/40 text-[11px] text-accent-light mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse" />
            منصة داخلية — وزارة الحرس الوطني
          </div>
          <h1 className="text-[36px] sm:text-[42px] font-black m-0 leading-tight">
            موسوعة القدرات العسكرية
          </h1>
          <p className="mt-4 text-text-muted leading-relaxed max-w-[760px] mx-auto text-[15px]">
            منصة مرجعية شاملة تجمع وتنظّم بيانات القدرات العسكرية ضمن
            <span className="text-accent-light font-bold"> 10 مسارات </span>
            رئيسية، مع تفاصيل لكل قدرة من المتطلبات التشغيلية والمواصفات الفنية
            والشركات المصنّعة وحالة التوطين، لتمكين الباحثين وصنّاع القرار من
            استعراض القدرات ومقارنتها بسهولة.
          </p>

          {/* Quick stats */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[760px] mx-auto">
            <div className="rounded-2xl border border-line bg-glass px-3 py-4">
              <Layers size={18} className="mx-auto text-accent-light mb-1.5" />
              <div className="text-xl font-black text-text">{MILITARY_PATHS.length}</div>
              <div className="text-[11px] text-text-muted mt-0.5">مسارات</div>
            </div>
            <div className="rounded-2xl border border-line bg-glass px-3 py-4">
              <Database size={18} className="mx-auto text-accent-light mb-1.5" />
              <div className="text-xl font-black text-text">
                {MILITARY_PATHS.reduce((sum, p) => sum + p.capabilityCount, 0)}+
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">قدرات مفهرسة</div>
            </div>
            <div className="rounded-2xl border border-line bg-glass px-3 py-4">
              <SearchIcon size={18} className="mx-auto text-accent-light mb-1.5" />
              <div className="text-xl font-black text-text">بحث ذكي</div>
              <div className="text-[11px] text-text-muted mt-0.5">داخل الموسوعة</div>
            </div>
            <Link
              href="/comparisons"
              className="rounded-2xl border border-accent/40 bg-accent-soft/30 px-3 py-4 hover:bg-accent-soft hover:border-accent transition-colors group"
            >
              <Scale size={18} className="mx-auto text-accent-light mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-black text-text">مقارنات</div>
              <div className="text-[11px] text-accent-light mt-0.5">بين الرموز والشركات</div>
            </Link>
          </div>

          <div className="mt-7 mx-auto flex gap-2.5 w-[min(650px,100%)] p-2.5 rounded-full border border-line bg-glass">
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

        {/* Comparisons CTA banner */}
        <Link
          href="/comparisons"
          className="block mt-3 mb-8 rounded-2xl overflow-hidden border border-line bg-gradient-to-l from-accent-soft/30 via-bg-soft to-bg-soft hover:border-accent transition-colors group"
        >
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shrink-0">
                <Scale size={28} className="text-white" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-text">صفحة المقارنات</div>
                <div className="text-xs sm:text-sm text-text-muted mt-0.5">
                  قارن بين قدرتين برمزيهما، أو بين شركتين تقدّمان نفس القدرة
                </div>
              </div>
            </div>
            <div className="text-accent-light group-hover:translate-x-[-4px] transition-transform">
              <ArrowLeft size={22} />
            </div>
          </div>
        </Link>

        {/* Section heading */}
        <div className="flex items-center gap-3 mt-2 mb-5 px-1">
          <div className="h-[2px] flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
          <h2 className="text-base font-bold text-text">المسارات العشرة</h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
        </div>

        {/* Grid */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
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
