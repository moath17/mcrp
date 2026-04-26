"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Loader2,
  FileText,
  Target,
  FlaskConical,
  Network,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Tag,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getPathBySlug,
  getDbNameFromSlug,
  FOUR_D_KEYS,
  FOUR_D_LABELS_AR,
  type FourDKey,
} from "@/lib/paths-config";

interface SiblingType {
  capability_code: string;
  type: string;
  four_d?: string;
}

interface TypeKey {
  capability_code: string;
  path: string;
  capability: string;
  sub_capability: string;
  type: string;
  four_d?: string;
}

interface TypeData {
  key: TypeKey | null;
  special: {
    capability_code: string;
    type: string;
    definition: string;
    operational_requirements: string;
    scenarios: string;
    sub_elements: string;
    units_used: string;
    local_entities: string;
    manufacturers: string;
  } | null;
  general: Record<string, string> | null;
}

interface CompanyListItem {
  company_name: string;
  capability_name: string;
}

const COMPANY_META: Record<
  string,
  { logo: string; accent: string; ring: string; bg: string }
> = {
  Hanwha: {
    logo: "/images/companies/hanwha.png",
    accent: "text-orange-300",
    ring: "ring-orange-400/50 border-orange-400/40",
    bg: "from-orange-500/15 via-amber-500/5 to-transparent",
  },
  Norinco: {
    logo: "/images/companies/norinco.png",
    accent: "text-red-300",
    ring: "ring-red-400/50 border-red-400/40",
    bg: "from-red-500/15 via-red-500/5 to-transparent",
  },
};

const FOUR_D_CHIP: Record<FourDKey, string> = {
  Detect: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  Deter: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  Defend: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  "Deployment Support":
    "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
};

function MiniCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof FileText;
  title: string;
  value: string;
}) {
  const isEmpty = !value || value.trim() === "";
  return (
    <div className="relative rounded-2xl border border-line bg-bg-soft/70 p-4 h-full flex flex-col min-h-[180px]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-line/70">
        <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
          <Icon size={14} className="text-accent-light" />
        </div>
        <h3 className="text-[12px] font-bold text-text">{title}</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          <p className="text-[11.5px] text-text-muted/50 italic leading-relaxed">
            لا توجد بيانات حالياً — سيتم تعبئتها لاحقاً
          </p>
        ) : (
          <p className="text-[12px] text-text-muted leading-relaxed line-clamp-6 whitespace-pre-wrap">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TypeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = decodeURIComponent(params.slug as string);
  const code = decodeURIComponent(params.code as string);
  const pathConfig = getPathBySlug(slug);
  const dbName = getDbNameFromSlug(slug);

  const rawFourD = searchParams.get("4d");
  const activeFourD: FourDKey | null = useMemo(() => {
    if (!rawFourD) return null;
    return (FOUR_D_KEYS as string[]).includes(rawFourD)
      ? (rawFourD as FourDKey)
      : null;
  }, [rawFourD]);

  const fourDSuffix = activeFourD
    ? `?4d=${encodeURIComponent(activeFourD)}`
    : "";

  const [data, setData] = useState<TypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [siblings, setSiblings] = useState<SiblingType[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);

  useEffect(() => {
    fetch(`/api/data?action=detail&code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success !== false) setData(res);
      })
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    fetch(`/api/company-profile?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCompanies(res.companies || []);
      });
  }, [code]);

  useEffect(() => {
    if (!dbName) return;
    fetch(`/api/path-capabilities?path=${encodeURIComponent(dbName)}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) return;
        const flat: SiblingType[] = [];
        type RawCap = {
          subCapabilities: {
            types: SiblingType[];
          }[];
        };
        for (const cap of (res.capabilities || []) as RawCap[]) {
          for (const sub of cap.subCapabilities || []) {
            for (const t of sub.types || []) {
              flat.push({
                capability_code: t.capability_code,
                type: t.type,
                four_d: t.four_d,
              });
            }
          }
        }
        setSiblings(flat);
      });
  }, [dbName]);

  const { prevCode, nextCode, currentIndex, totalInFilter } = useMemo(() => {
    const list = activeFourD
      ? siblings.filter((s) => s.four_d === activeFourD)
      : siblings;
    const idx = list.findIndex((s) => s.capability_code === code);
    return {
      prevCode: idx > 0 ? list[idx - 1].capability_code : null,
      nextCode:
        idx >= 0 && idx < list.length - 1 ? list[idx + 1].capability_code : null,
      currentIndex: idx,
      totalInFilter: list.length,
    };
  }, [siblings, activeFourD, code]);

  const buildTypeHref = (targetCode: string) =>
    `/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(
      targetCode
    )}${fourDSuffix}`;

  const buildCompanyHref = (companyName: string) =>
    `/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(
      code
    )}/company/${encodeURIComponent(companyName)}${fourDSuffix}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin-slow text-accent" />
      </div>
    );
  }

  if (!data || !data.key) {
    return (
      <div className="animate-fade-in">
        <Breadcrumb
          items={[
            {
              label: pathConfig?.name || slug,
              href: `/path/${encodeURIComponent(slug)}${fourDSuffix}`,
            },
            { label: "تفاصيل النوع" },
          ]}
        />
        <div className="glass-panel rounded-2xl p-12 text-center">
          <h2 className="text-lg font-medium text-text-muted">
            لم يتم العثور على البيانات
          </h2>
        </div>
      </div>
    );
  }

  const { key, special } = data;
  const fourDKey = (key.four_d || activeFourD || "") as FourDKey;

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          {
            label: pathConfig?.name || slug,
            href: `/path/${encodeURIComponent(slug)}${fourDSuffix}`,
          },
          {
            label:
              key.type || key.sub_capability || key.capability || "تفاصيل النوع",
          },
        ]}
      />

      {/* Hero / header strip */}
      <div className="glass-panel rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shrink-0">
              <FileText size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-text truncate">
                {key.type || key.sub_capability || "تفاصيل النوع"}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-bg-soft/80 text-text-muted border border-line">
                  {key.capability_code}
                </span>
                {key.capability && (
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-soft text-accent-light border border-accent/20">
                    {key.capability}
                  </span>
                )}
                {key.sub_capability && (
                  <span className="px-2.5 py-0.5 rounded-full bg-accent2-soft text-accent2 border border-accent2/20">
                    {key.sub_capability}
                  </span>
                )}
                {fourDKey && FOUR_D_CHIP[fourDKey] && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-bold ${FOUR_D_CHIP[fourDKey]}`}
                  >
                    <Tag size={10} />
                    {fourDKey} • {FOUR_D_LABELS_AR[fourDKey]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inline prev/next */}
          {siblings.length > 0 && currentIndex >= 0 && (
            <div className="flex items-center gap-2">
              {prevCode ? (
                <Link
                  href={buildTypeHref(prevCode)}
                  title="النوع السابق"
                  className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-bg-soft hover:border-accent-light hover:bg-accent-soft/30 transition-all text-sm"
                >
                  <ChevronRight size={16} className="text-accent-light" />
                  <span className="text-xs text-text-muted group-hover:text-text">
                    السابق
                  </span>
                </Link>
              ) : null}
              <div className="text-[11px] text-text-muted px-2">
                <span className="font-black text-text">
                  {currentIndex + 1}
                </span>
                <span className="text-text-muted/60"> / {totalInFilter}</span>
                {activeFourD && (
                  <span className="block text-[10px] text-accent-light mt-0.5">
                    ضمن «{FOUR_D_LABELS_AR[activeFourD]}»
                  </span>
                )}
              </div>
              {nextCode ? (
                <Link
                  href={buildTypeHref(nextCode)}
                  title="النوع التالي"
                  className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-bg-soft hover:border-accent-light hover:bg-accent-soft/30 transition-all text-sm"
                >
                  <span className="text-xs text-text-muted group-hover:text-text">
                    التالي
                  </span>
                  <ChevronLeft size={16} className="text-accent-light" />
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Main content grid: 4 info mini-cards on top, 2 big company cards below. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MiniCard
          icon={FileText}
          title="تعريف القدرة"
          value={special?.definition || ""}
        />
        <MiniCard
          icon={Target}
          title="المتطلبات العملياتية"
          value={special?.operational_requirements || ""}
        />
        <MiniCard
          icon={FlaskConical}
          title="سيناريوهات ومتطلبات التجارب"
          value={special?.scenarios || ""}
        />
        <MiniCard
          icon={Network}
          title="العناصر الفرعية المكونة للقدرة"
          value={special?.sub_elements || ""}
        />
      </div>

      {/* Companies section */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-[2px] flex-1 bg-gradient-to-l from-accent/40 to-transparent" />
          <h2 className="text-sm font-bold text-text">
            الشركات المصنعة للقدرة
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
        </div>

        {companies.length === 0 ? (
          <p className="text-sm text-text-muted/60 text-center italic py-8">
            لا توجد شركات مرتبطة بهذا النوع
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((c) => {
              const meta =
                COMPANY_META[c.company_name] || COMPANY_META.Hanwha;
              return (
                <Link
                  key={c.company_name}
                  href={buildCompanyHref(c.company_name)}
                  className={`group relative block rounded-2xl overflow-hidden border bg-bg-soft hover:ring-2 ${meta.ring} transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${meta.bg} pointer-events-none`}
                  />
                  <div className="relative p-5 flex items-center gap-4">
                    {/* Logo */}
                    <div className="shrink-0 w-28 h-28 rounded-xl bg-white flex items-center justify-center border border-line overflow-hidden">
                      <Image
                        src={meta.logo}
                        alt={c.company_name}
                        width={220}
                        height={220}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-bold ${meta.accent}`}>
                        {c.company_name === "Hanwha"
                          ? "كوريا الجنوبية"
                          : c.company_name === "Norinco"
                          ? "الصين"
                          : ""}
                      </div>
                      <div className="text-xl font-black text-text mt-0.5">
                        {c.company_name}
                      </div>
                      <div className="mt-2 pt-2 border-t border-line/60">
                        <div className="text-[11px] text-text-muted">
                          اسم القدرة
                        </div>
                        <div className="text-sm font-bold text-text mt-0.5 truncate">
                          {c.capability_name || "—"}
                        </div>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="shrink-0 w-9 h-9 rounded-lg bg-accent-soft/60 flex items-center justify-center group-hover:bg-accent-soft group-hover:-translate-x-0.5 transition-all">
                      <ArrowLeft size={18} className="text-accent-light" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
