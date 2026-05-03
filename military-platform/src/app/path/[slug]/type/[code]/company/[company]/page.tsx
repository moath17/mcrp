"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
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

// Bump LOGO_VERSION whenever the logo files in /public/images/companies are
// replaced, so that next/image and the browser fetch the fresh asset.
const LOGO_VERSION = "2";

const COMPANY_META: Record<
  string,
  { logo: string; country: string; accent: string; badge: string }
> = {
  Hanwha: {
    logo: `/images/companies/hanwha.png?v=${LOGO_VERSION}`,
    country: "كوريا الجنوبية",
    accent: "text-orange-300",
    badge: "bg-orange-500/10 border-orange-400/30",
  },
  Norinco: {
    logo: `/images/companies/norinco.png?v=${LOGO_VERSION}`,
    country: "الصين",
    accent: "text-red-300",
    badge: "bg-red-500/10 border-red-400/30",
  },
};

const FOUR_D_CHIP: Record<FourDKey, string> = {
  Detect: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  Deter: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  Defend: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  "Deployment Support":
    "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
};

/**
 * FormCell — a single rectangular field that mirrors the look of an Excel
 * template cell: small label band on top, then the actual data below.
 * Kept intentionally calm (soft borders, low contrast) per the original
 * template's note "محاولة اظهار الحدود (لكل خانة) بشكل هادئ".
 */
function FormCell({
  label,
  value,
  minHeight = "min-h-[78px]",
  clamp = "line-clamp-3",
  centerLabel = false,
}: {
  label: string;
  value?: string;
  minHeight?: string;
  clamp?: string;
  centerLabel?: boolean;
}) {
  const isEmpty = !value || value.trim() === "";
  return (
    <div
      className={`group rounded-md border border-line/60 bg-bg-soft/40 hover:border-accent/40 hover:bg-bg-soft/60 transition-colors overflow-hidden ${minHeight} flex flex-col`}
    >
      <div
        className={`px-3 py-1.5 bg-bg-soft/80 border-b border-line/50 ${
          centerLabel ? "text-center" : "text-right"
        }`}
      >
        <span className="text-[12.5px] font-bold text-text-muted tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex-1 px-3 py-2 overflow-hidden">
        {isEmpty ? (
          <p className="text-[12px] text-text-muted/50 italic leading-relaxed">
            لا توجد بيانات
          </p>
        ) : (
          <p
            className={`text-[13.5px] text-text leading-relaxed whitespace-pre-wrap ${clamp}`}
            title={value}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

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
  const subTitleText =
    key.sub_capability ||
    key.capability ||
    pathConfig?.name ||
    "العنوان الفرعي";

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

      {/* ───────────────── Top header strip ─────────────────
          Mirrors the Excel template:
            - Sub-title bar (wide, gray) on the right (RTL leading edge)
            - Red "النوع" cell on the left of the strip
            - Small back-link aligned with the strip
      */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-12 md:col-span-9 order-2 md:order-1">
          <div className="rounded-md border border-line/60 bg-bg-soft/60 px-3.5 py-2.5 h-full flex items-center gap-3">
            <span className="text-[12px] font-bold text-text-muted shrink-0">
              العنوان الفرعي
            </span>
            <span className="h-4 w-px bg-line/60" />
            <span className="text-[15px] font-bold text-text truncate">
              {subTitleText}
            </span>
            {fourDKey && FOUR_D_CHIP[fourDKey] && (
              <span
                className={`mr-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[12px] font-bold ${FOUR_D_CHIP[fourDKey]}`}
              >
                {fourDKey} • {FOUR_D_LABELS_AR[fourDKey]}
              </span>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 order-1 md:order-2">
          <div className="rounded-md border border-red-500/40 overflow-hidden">
            <div className="bg-red-700/80 px-3 py-1.5 text-center">
              <span className="text-[12.5px] font-black text-white tracking-wider">
                النوع
              </span>
            </div>
            <div className="px-3 py-2 bg-bg-soft/60 text-center">
              <span className="text-[14px] font-bold text-text truncate block">
                {key.type || profile.type || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── Main composite block ─────────────────
          2-column layout (RTL DOM order = visual right→left):
            • Right (md:col-span-6): stacked label cells
            • Left (md:col-span-6): image + small footer cells
      */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        {/* ===== Stacked field cells (right) ===== */}
        <section className="col-span-12 md:col-span-6 order-1 flex flex-col gap-1.5">
          <FormCell
            label="اسم الشركة او Logo"
            value={profile.company_name || company}
            minHeight="min-h-[70px]"
            clamp="line-clamp-2"
          />
          <FormCell
            label="تعريف بالشركة"
            value={profile.company_info}
            minHeight="min-h-[100px]"
            clamp="line-clamp-4"
          />
          <FormCell
            label="تاريخ التطوير الخاص بالقدرة"
            value={profile.development_history}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
          />
          <FormCell
            label="عائلة القدرة والأنواع المتاحة"
            value={profile.family}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
          />
          <FormCell
            label="تشكيل المنظومة (ان وجدت)"
            value={profile.system_formation}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
          />
          <FormCell
            label="تكلفة القدرة"
            value={profile.cost}
            minHeight="min-h-[70px]"
            clamp="line-clamp-2"
          />
        </section>

        {/* ===== Image + footer cells (leftmost) ===== */}
        <section className="col-span-12 md:col-span-6 order-2 flex flex-col gap-1.5">
          <div
            className={`relative flex-1 min-h-[300px] rounded-md border ${meta.badge} overflow-hidden flex items-center justify-center bg-white`}
          >
            <Image
              src={meta.logo}
              alt={company}
              width={520}
              height={520}
              className="w-full h-full object-contain p-6"
            />
            <div
              className={`absolute top-2 right-2 px-2.5 py-1 rounded-full border text-[12px] font-bold bg-bg-soft/90 border-line/70 ${meta.accent}`}
            >
              {meta.country}
            </div>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-bg-soft/90 border border-line/70 text-[12px] font-bold text-text-muted">
              {key.capability_code}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            <div className="col-span-4">
              <FormCell
                label="حالة التوطين للقدرة"
                value={profile.localization_status}
                minHeight="min-h-[72px]"
                clamp="line-clamp-2"
                centerLabel
              />
            </div>
            <div className="col-span-8">
              <FormCell
                label="اسم القدرة"
                value={profile.capability_name}
                minHeight="min-h-[72px]"
                clamp="line-clamp-2"
                centerLabel
              />
            </div>
          </div>
        </section>
      </div>

      {/* ───────────────── Full-width row: نطاق التعريف ───────────────── */}
      <div className="mb-2">
        <FormCell
          label="نطاق التعريف للقدرة"
          value={profile.scope_definition}
          minHeight="min-h-[100px]"
          clamp="line-clamp-4"
        />
      </div>

      {/* ───────────────── Paired 6 fields (2×3 grid) ─────────────────
          Order matches the template:
            row1:  متطلبات التخزين والاستدامة  |  التسليح والذخائر/الصواريخ
            row2:  الاختبارات المصنعية للقدرة   |  الأنظمة الفرعية المرتبطة بالقدرة
            row3:  مشاركة القدرة في النزاعات    |  متطلبات التدريب
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2">
          <FormCell
            label="متطلبات التخزين والاستدامة"
            value={profile.storage_requirements}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
          <FormCell
            label="التسليح والذخائر / الصواريخ"
            value={profile.armament}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
          <FormCell
            label="الاختبارات المصنعية للقدرة"
            value={profile.factory_tests}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
          <FormCell
            label="الأنظمة الفرعية المرتبطة بالقدرة"
            value={profile.sub_systems}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
          <FormCell
            label="مشاركة القدرة في النزاعات"
            value={profile.conflict_participation}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
          <FormCell
            label="متطلبات التدريب"
            value={profile.training_requirements}
            minHeight="min-h-[88px]"
            clamp="line-clamp-3"
            centerLabel
          />
        </div>

      {/* ───────────────── Countries / map (large full-width cell) ───────────────── */}
      <div className="mb-3">
        <FormCell
          label="الدول والقوات المستخدمة للقدرة (خريطة)"
          value={profile.countries_used}
          minHeight="min-h-[160px]"
          clamp="line-clamp-7"
          centerLabel
        />
      </div>

      {/* ───────────────── Technical specs table ─────────────────
          Mirrors the green-headed table in the template:
            ┌──────────── المواصفات الفنية ────────────┐
            │  الهدف (left)         |   المعيار (right) │
            │  ...rows...                              │
      */}
      <TechSpecsTable value={profile.technical_specs} />

      {/* ───────────────── Footer link ───────────────── */}
      <div className="mt-4 flex justify-end">
        <Link
          href={typeHref}
          className="group flex items-center gap-2 px-4 py-2 rounded-md border border-line/60 bg-bg-soft/40 hover:border-accent-light hover:bg-accent-soft/30 transition-all text-[13px]"
        >
          <span className="text-text-muted group-hover:text-text">
            رجوع لصفحة النوع
          </span>
          <ArrowRight size={16} className="text-accent-light" />
        </Link>
      </div>
    </div>
  );
}

/**
 * TechSpecsTable — renders technical_specs as a 2-column table
 * (المعيار | الهدف) with a green header band, mirroring the Excel template.
 *
 * Parsing rules (best-effort, since the source is a free-text field):
 *   - Split text on newlines → each non-empty line is one row.
 *   - Inside a line, split on the first occurrence of " : ", "|", " - "
 *     or "\t" to separate criterion (right) from target (left).
 *   - If no separator is found, the whole line goes in the criterion column.
 *   - When the field is empty, render 5 placeholder rows so the table still
 *     looks like the template.
 */
function TechSpecsTable({ value }: { value?: string }) {
  const rows = parseSpecRows(value);
  return (
    <div className="rounded-md border border-emerald-500/30 overflow-hidden">
      <div className="bg-emerald-700/80 px-3 py-2 text-center border-b border-emerald-500/30">
        <span className="text-[14px] font-black text-white tracking-wider">
          المواصفات الفنية
        </span>
      </div>
      <div className="grid grid-cols-2 bg-bg-soft/70 border-b border-line/50">
        <div className="px-3 py-2 text-center border-l border-line/50">
          <span className="text-[12.5px] font-bold text-text-muted">
            الهدف
          </span>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="text-[12.5px] font-bold text-text-muted">
            المعيار
          </span>
        </div>
      </div>
      <div>
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-2 ${
              i % 2 === 0 ? "bg-bg-soft/30" : "bg-bg-soft/10"
            } border-b border-line/30 last:border-b-0`}
          >
            <div className="px-3 py-2.5 border-l border-line/40 min-h-[42px] flex items-center">
              {row.target ? (
                <span className="text-[13px] text-text leading-relaxed whitespace-pre-wrap">
                  {row.target}
                </span>
              ) : (
                <span className="text-[12px] text-text-muted/50 italic">
                  —
                </span>
              )}
            </div>
            <div className="px-3 py-2.5 min-h-[42px] flex items-center">
              {row.criterion ? (
                <span className="text-[13px] text-text leading-relaxed whitespace-pre-wrap">
                  {row.criterion}
                </span>
              ) : (
                <span className="text-[12px] text-text-muted/50 italic">
                  —
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseSpecRows(
  value?: string
): { criterion: string; target: string }[] {
  const empty = Array.from({ length: 5 }, () => ({ criterion: "", target: "" }));
  if (!value || value.trim() === "") return empty;

  const lines = value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return empty;

  const splitRow = (line: string): { criterion: string; target: string } => {
    // try common separators in order
    const seps = [/\s\|\s/, /\t+/, /\s:\s/, /:\s/, /\s-\s/, /:/];
    for (const sep of seps) {
      const m = line.split(sep);
      if (m.length >= 2) {
        return {
          criterion: m[0].trim(),
          target: m.slice(1).join(" ").trim(),
        };
      }
    }
    return { criterion: line, target: "" };
  };

  const parsed = lines.map(splitRow);
  // Pad to at least 5 rows so the table keeps its template look
  while (parsed.length < 5) parsed.push({ criterion: "", target: "" });
  return parsed;
}
