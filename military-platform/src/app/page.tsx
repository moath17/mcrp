"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Database,
  Search as SearchIcon,
  Scale,
  ArrowLeft,
  Eye,
  Shield,
  ShieldAlert,
  Truck,
  X,
} from "lucide-react";
import {
  MILITARY_PATHS,
  FOUR_D_KEYS,
  FOUR_D_LABELS_AR,
  FOUR_D_DESCRIPTIONS,
  FOUR_D_PATHS,
  type FourDKey,
} from "@/lib/paths-config";

const FOUR_D_ICONS: Record<FourDKey, typeof Eye> = {
  Detect: Eye,
  Deter: ShieldAlert,
  Defend: Shield,
  "Deployment Support": Truck,
};

// Accent gradients tuned to the dark theme (text stays readable).
const FOUR_D_STYLES: Record<
  FourDKey,
  { gradient: string; ring: string; chip: string }
> = {
  Detect: {
    gradient: "from-sky-500/25 via-sky-500/10 to-transparent",
    ring: "ring-sky-400/60 border-sky-400/50",
    chip: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  },
  Deter: {
    gradient: "from-amber-500/25 via-amber-500/10 to-transparent",
    ring: "ring-amber-400/60 border-amber-400/50",
    chip: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  },
  Defend: {
    gradient: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    ring: "ring-emerald-400/60 border-emerald-400/50",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  },
  "Deployment Support": {
    gradient: "from-fuchsia-500/25 via-fuchsia-500/10 to-transparent",
    ring: "ring-fuchsia-400/60 border-fuchsia-400/50",
    chip: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
  },
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeFourD, setActiveFourD] = useState<FourDKey | null>(null);

  const filtered = useMemo(() => {
    let list = MILITARY_PATHS;
    if (activeFourD) {
      const allowed = new Set(FOUR_D_PATHS[activeFourD]);
      list = list.filter((p) => allowed.has(p.dbName));
    }
    const q = search.trim();
    if (q) {
      list = list.filter(
        (p) => p.name.includes(q) || p.subtitle.includes(q)
      );
    }
    return list;
  }, [search, activeFourD]);

  const buildPathHref = (pathName: string) => {
    const base = `/path/${encodeURIComponent(pathName)}`;
    return activeFourD
      ? `${base}?4d=${encodeURIComponent(activeFourD)}`
      : base;
  };

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
              <div className="text-[11px] text-accent-light mt-0.5">بين القدرات والحلول</div>
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

        {/* 4D Filter */}
        <section className="mt-4 mb-3">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-[2px] flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text">تصنيف 4D</h2>
              <span className="text-[11px] text-text-muted/80">
                Detect • Deter • Defend • Deployment Support
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {FOUR_D_KEYS.map((key) => {
              const Icon = FOUR_D_ICONS[key];
              const style = FOUR_D_STYLES[key];
              const active = activeFourD === key;
              const pathCount = FOUR_D_PATHS[key].length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveFourD((prev) => (prev === key ? null : key))
                  }
                  aria-pressed={active}
                  className={`relative text-right rounded-2xl overflow-hidden border bg-bg-soft p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                    active
                      ? `ring-2 ${style.ring} shadow-[0_18px_50px_rgba(37,99,235,0.25)]`
                      : "border-line hover:border-accent-light"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.gradient} pointer-events-none`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.chip}`}
                        >
                          {key}
                        </span>
                        {active && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-accent-light">
                            <X size={11} /> إلغاء الفلتر
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-black text-text leading-tight">
                        {FOUR_D_LABELS_AR[key]}
                      </div>
                      <p className="text-[11.5px] text-text-muted mt-1.5 leading-relaxed line-clamp-2">
                        {FOUR_D_DESCRIPTIONS[key]}
                      </p>
                      <div className="mt-2.5 text-[11px] text-text-muted/80">
                        {pathCount} {pathCount === 1 ? "مسار" : "مسارات"}
                      </div>
                    </div>
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-black/30 border border-line flex items-center justify-center">
                      <Icon size={20} className="text-text" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {activeFourD && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft/30 px-4 py-2.5">
              <div className="text-[13px] text-text">
                الفلتر الحالي:{" "}
                <span className="font-bold text-accent-light">
                  {FOUR_D_LABELS_AR[activeFourD]} ({activeFourD})
                </span>{" "}
                — يعرض {FOUR_D_PATHS[activeFourD].length}{" "}
                {FOUR_D_PATHS[activeFourD].length === 1 ? "مسار" : "مسارات"}
                {activeFourD !== "Deployment Support" && (
                  <span className="text-text-muted">
                    {" "}
                    • داخل كل مسار تظهر الأنواع المصنفة «{activeFourD}» فقط
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveFourD(null)}
                className="inline-flex items-center gap-1 text-xs text-accent-light hover:text-text transition-colors"
              >
                <X size={14} /> إزالة الفلتر
              </button>
            </div>
          )}
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
          <h2 className="text-base font-bold text-text">
            {activeFourD
              ? `مسارات «${FOUR_D_LABELS_AR[activeFourD]}» (${filtered.length})`
              : "المسارات العشرة"}
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
        </div>

        {/* Grid */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {filtered.map((path) => (
            <Link
              key={path.name}
              href={buildPathHref(path.name)}
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
