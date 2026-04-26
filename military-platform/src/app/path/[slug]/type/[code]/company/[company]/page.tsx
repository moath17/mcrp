"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  Building2,
  Tag,
  Boxes,
  Calendar,
  Crosshair,
  Wallet,
  GitBranch,
  Cpu,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Layers,
  FlaskConical,
  Warehouse,
  Wrench,
  Swords,
  Info,
  FileText,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getPathBySlug,
  FOUR_D_KEYS,
  FOUR_D_LABELS_AR,
  type FourDKey,
} from "@/lib/paths-config";

interface KeyRow {
  capability_code: string;
  path: string;
  capability: string;
  sub_capability: string;
  type: string;
  four_d?: string;
}

interface Profile {
  capability_code: string;
  type: string;
  capability_name: string;
  company_name: string;
  company_info: string;
  scope_definition: string;
  development_history: string;
  armament: string;
  cost: string;
  family: string;
  technical_specs: string;
  countries_used: string;
  training_requirements: string;
  localization_status: string;
  system_formation: string;
  factory_tests: string;
  storage_requirements: string;
  sub_systems: string;
  conflict_participation: string;
}

const COMPANY_META: Record<
  string,
  { logo: string; country: string; accent: string; border: string; bgFrom: string }
> = {
  Hanwha: {
    logo: "/images/companies/hanwha.png",
    country: "كوريا الجنوبية",
    accent: "text-orange-300",
    border: "border-orange-400/40",
    bgFrom: "from-orange-500/10",
  },
  Norinco: {
    logo: "/images/companies/norinco.png",
    country: "الصين",
    accent: "text-red-300",
    border: "border-red-400/40",
    bgFrom: "from-red-500/10",
  },
};

const FOUR_D_CHIP: Record<FourDKey, string> = {
  Detect: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  Deter: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  Defend: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  "Deployment Support":
    "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
};

// 19 fields — exact order, with icon + label.
// Laid out on a 5-col grid (xl) so we get 4 rows (5+5+5+4 = 19) that fit
// into a single viewport on desktop. On smaller screens the grid degrades
// gracefully (4 / 3 / 2 cols).
type FieldKey = Exclude<keyof Profile, "capability_code" | "company_name">;

const FIELDS: {
  key: FieldKey;
  label: string;
  icon: typeof FileText;
  // clamp controls how many lines the card body shows
  clamp: number;
}[] = [
  { key: "capability_name", label: "اسم القدرة", icon: Tag, clamp: 2 },
  { key: "type", label: "النوع", icon: Boxes, clamp: 2 },
  { key: "company_info", label: "تعريف بالشركة", icon: Building2, clamp: 5 },
  { key: "scope_definition", label: "نطاق التعريف للقدرة", icon: Info, clamp: 5 },
  {
    key: "development_history",
    label: "تاريخ التطوير الخاص بالقدرة",
    icon: Calendar,
    clamp: 5,
  },
  { key: "armament", label: "التسليح والذخائر/الصواريخ", icon: Crosshair, clamp: 5 },
  { key: "cost", label: "تكلفة القدرة", icon: Wallet, clamp: 2 },
  { key: "family", label: "عائلة القدرة والأنواع المتاحة", icon: GitBranch, clamp: 5 },
  { key: "technical_specs", label: "المواصفات الفنية", icon: Cpu, clamp: 5 },
  {
    key: "countries_used",
    label: "الدول والقوات المستخدمة",
    icon: Globe2,
    clamp: 3,
  },
  { key: "training_requirements", label: "متطلبات التدريب", icon: GraduationCap, clamp: 5 },
  {
    key: "localization_status",
    label: "حالة التوطين للقدرة",
    icon: ShieldCheck,
    clamp: 2,
  },
  { key: "system_formation", label: "تشكيل المنظومة", icon: Layers, clamp: 5 },
  {
    key: "factory_tests",
    label: "الاختبارات المصنعية",
    icon: FlaskConical,
    clamp: 5,
  },
  {
    key: "storage_requirements",
    label: "متطلبات التخزين والاستدامة",
    icon: Warehouse,
    clamp: 5,
  },
  { key: "sub_systems", label: "الأنظمة الفرعية المرتبطة", icon: Wrench, clamp: 5 },
  {
    key: "conflict_participation",
    label: "المشاركة في النزاعات",
    icon: Swords,
    clamp: 5,
  },
];
// Note: the grid shows 17 "data" cards here; the remaining 2 out of the 19 sheet fields
// (رمز القدرة، اسم الشركة) appear as the hero badges — we don't waste grid cells on them.

const CLAMP_MAP: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export default function CompanyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = decodeURIComponent(params.slug as string);
  const code = decodeURIComponent(params.code as string);
  const company = decodeURIComponent(params.company as string);
  const pathConfig = getPathBySlug(slug);

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

  const [key, setKey] = useState<KeyRow | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/company-profile?code=${encodeURIComponent(code)}&company=${encodeURIComponent(company)}`
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setKey(res.key || null);
          setProfile(res.profile || null);
        }
      })
      .finally(() => setLoading(false));
  }, [code, company]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin-slow text-accent" />
      </div>
    );
  }

  if (!profile || !key) {
    return (
      <div className="animate-fade-in">
        <Breadcrumb
          items={[
            {
              label: pathConfig?.name || slug,
              href: `/path/${encodeURIComponent(slug)}${fourDSuffix}`,
            },
            {
              label: "النوع",
              href: `/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(code)}${fourDSuffix}`,
            },
            { label: company },
          ]}
        />
        <div className="glass-panel rounded-2xl p-12 text-center">
          <h2 className="text-lg font-medium text-text-muted">
            لم يتم العثور على بيانات الشركة
          </h2>
        </div>
      </div>
    );
  }

  const meta = COMPANY_META[company] || COMPANY_META.Hanwha;
  const fourDKey = (key.four_d || activeFourD || "") as FourDKey;
  const typeHref = `/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(code)}${fourDSuffix}`;

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          {
            label: pathConfig?.name || slug,
            href: `/path/${encodeURIComponent(slug)}${fourDSuffix}`,
          },
          {
            label: key.type || key.sub_capability || "النوع",
            href: typeHref,
          },
          { label: company },
        ]}
      />

      {/* Hero strip — logo + capability name + metadata + back link. Compact. */}
      <div
        className={`relative glass-panel rounded-2xl p-4 mb-3 overflow-hidden border ${meta.border}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-l ${meta.bgFrom} via-transparent to-transparent pointer-events-none`}
        />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center border border-line overflow-hidden shrink-0">
              <Image
                src={meta.logo}
                alt={company}
                width={220}
                height={220}
                className="w-full h-full object-contain p-1.5"
              />
            </div>
            <div className="min-w-0">
              <div
                className={`text-[11px] font-bold uppercase tracking-wider ${meta.accent}`}
              >
                {meta.country}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-text leading-tight">
                {profile.capability_name || company}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-bg-soft/80 text-text-muted border border-line font-bold">
                  {company}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-bg-soft/80 text-text-muted border border-line">
                  {key.capability_code}
                </span>
                {key.capability && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent-light border border-accent/20">
                    {key.capability}
                  </span>
                )}
                {key.sub_capability && (
                  <span className="px-2 py-0.5 rounded-full bg-accent2-soft text-accent2 border border-accent2/20">
                    {key.sub_capability}
                  </span>
                )}
                {fourDKey && FOUR_D_CHIP[fourDKey] && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold ${FOUR_D_CHIP[fourDKey]}`}
                  >
                    <Tag size={10} />
                    {fourDKey} • {FOUR_D_LABELS_AR[fourDKey]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={typeHref}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-line bg-bg-soft hover:border-accent-light hover:bg-accent-soft/30 transition-all text-sm"
          >
            <span className="text-xs text-text-muted group-hover:text-text">
              رجوع لصفحة النوع
            </span>
            <ArrowRight size={16} className="text-accent-light" />
          </Link>
        </div>
      </div>

      {/* Dashboard grid — 19 fields */}
      {/*
        Responsive column plan:
          mobile: 1 col
          sm: 2 cols
          md: 3 cols
          lg: 4 cols
          xl: 5 cols (desktop: 4 rows × ≈5 cols fit 17 cards without scroll)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 auto-rows-fr">
        {FIELDS.map(({ key: fieldKey, label, icon: Icon, clamp }) => {
          const value = (profile[fieldKey] as string) || "";
          const isEmpty = !value || value.trim() === "";
          const clampClass = CLAMP_MAP[clamp] || "line-clamp-5";
          return (
            <div
              key={fieldKey}
              className="group relative rounded-xl border border-line bg-bg-soft/70 p-2.5 flex flex-col min-h-[150px] hover:border-accent/40 hover:bg-bg-soft transition-colors"
              title={value}
            >
              <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-line/60">
                <div className="w-6 h-6 rounded-md bg-accent-soft flex items-center justify-center shrink-0">
                  <Icon size={12} className="text-accent-light" />
                </div>
                <h3 className="text-[11px] font-bold text-text truncate">
                  {label}
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                {isEmpty ? (
                  <p className="text-[11px] text-text-muted/50 italic leading-snug">
                    لا توجد بيانات
                  </p>
                ) : (
                  <p
                    className={`text-[11.5px] text-text leading-snug whitespace-pre-wrap ${clampClass}`}
                  >
                    {value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
