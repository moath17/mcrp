"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  GitCompare,
  Loader2,
  Scale,
  Building2,
  Hash,
  Inbox,
  ChevronDown,
  Check,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

type Mode = "codes" | "companies";

interface CodeOption {
  capability_code: string;
  path: string;
  capability: string;
  sub_capability: string;
  type: string;
  company_count: number;
}

interface CodeAggregate {
  key: Record<string, string>;
  company_count: number;
  companies: string[];
  capability_name: string;
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

type CompanyRow = Record<string, string> & { key: Record<string, string> };

const FIELDS: { key: string; label: string }[] = [
  { key: "capability_name", label: "اسم القدرة" },
  { key: "scope_definition", label: "نطاق التعريف للقدرة" },
  { key: "development_history", label: "تاريخ التطوير" },
  { key: "armament", label: "التسليح والذخائر" },
  { key: "cost", label: "تكلفة القدرة" },
  { key: "family", label: "عائلة القدرة والأنواع المتاحة" },
  { key: "technical_specs", label: "المواصفات الفنية" },
  { key: "countries_used", label: "الدول والقوات المستخدمة" },
  { key: "training_requirements", label: "متطلبات التدريب" },
  { key: "localization_status", label: "حالة التوطين" },
  { key: "system_formation", label: "تشكيل المنظومة" },
  { key: "factory_tests", label: "الاختبارات المصنعية" },
  { key: "storage_requirements", label: "متطلبات التخزين والاستدامة" },
  { key: "sub_systems", label: "الأنظمة الفرعية المرتبطة" },
  { key: "conflict_participation", label: "مشاركة القدرة في النزاعات" },
];

const COMPANY_FIELDS: { key: string; label: string }[] = [
  { key: "company_name", label: "اسم الشركة" },
  { key: "company_info", label: "تعريف بالشركة" },
  ...FIELDS,
];


export default function ComparisonsPage() {
  const [mode, setMode] = useState<Mode>("codes");

  // Shared dropdown source
  const [allCodes, setAllCodes] = useState<CodeOption[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  // Mode 1: code vs code
  const [codeA, setCodeA] = useState("");
  const [codeB, setCodeB] = useState("");
  const [aggA, setAggA] = useState<CodeAggregate | null>(null);
  const [aggB, setAggB] = useState<CodeAggregate | null>(null);
  const [loadingPair, setLoadingPair] = useState(false);

  // Mode 2: company vs company within a code
  const [selectedCode, setSelectedCode] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");
  const [rowA, setRowA] = useState<CompanyRow | null>(null);
  const [rowB, setRowB] = useState<CompanyRow | null>(null);
  const [loadingCompanyPair, setLoadingCompanyPair] = useState(false);

  useEffect(() => {
    setLoadingCodes(true);
    fetch("/api/comparisons?action=codes")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAllCodes(res.codes);
      })
      .finally(() => setLoadingCodes(false));
  }, []);

  // Reset state when switching modes
  const switchMode = (m: Mode) => {
    setMode(m);
    setAggA(null);
    setAggB(null);
    setRowA(null);
    setRowB(null);
  };

  // Fetch companies whenever selectedCode changes (mode 2)
  useEffect(() => {
    if (!selectedCode) {
      setCompanies([]);
      setCompanyA("");
      setCompanyB("");
      setRowA(null);
      setRowB(null);
      return;
    }
    setLoadingCompanies(true);
    setCompanyA("");
    setCompanyB("");
    setRowA(null);
    setRowB(null);
    fetch(`/api/comparisons?action=companies&code=${encodeURIComponent(selectedCode)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCompanies(res.companies);
      })
      .finally(() => setLoadingCompanies(false));
  }, [selectedCode]);

  const codesWithCompanies = useMemo(
    () => allCodes.filter((c) => c.company_count > 0),
    [allCodes]
  );

  const fetchCodePair = async () => {
    if (!codeA || !codeB) return;
    setLoadingPair(true);
    setAggA(null);
    setAggB(null);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/comparisons?action=code&code=${encodeURIComponent(codeA)}`).then((r) => r.json()),
        fetch(`/api/comparisons?action=code&code=${encodeURIComponent(codeB)}`).then((r) => r.json()),
      ]);
      if (resA.success) setAggA(resA.data);
      if (resB.success) setAggB(resB.data);
    } finally {
      setLoadingPair(false);
    }
  };

  const fetchCompanyPair = async () => {
    if (!selectedCode || !companyA || !companyB) return;
    setLoadingCompanyPair(true);
    setRowA(null);
    setRowB(null);
    try {
      const [resA, resB] = await Promise.all([
        fetch(
          `/api/comparisons?action=company&code=${encodeURIComponent(selectedCode)}&company=${encodeURIComponent(companyA)}`
        ).then((r) => r.json()),
        fetch(
          `/api/comparisons?action=company&code=${encodeURIComponent(selectedCode)}&company=${encodeURIComponent(companyB)}`
        ).then((r) => r.json()),
      ]);
      if (resA.success) setRowA(resA.data);
      if (resB.success) setRowB(resB.data);
    } finally {
      setLoadingCompanyPair(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Breadcrumb items={[{ label: "صفحة المقارنات" }]} />

      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shrink-0">
            <Scale size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text">صفحة المقارنات</h1>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              قارن بين قدرتين باستخدام رمز القدرة، أو قارن بين شركتين تقدّمان نفس
              القدرة. البيانات مستندة إلى نموذج «المتطلب العام».
            </p>
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="glass-panel rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => switchMode("codes")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            mode === "codes"
              ? "bg-accent-soft text-accent-light border border-accent/30"
              : "text-text-muted hover:bg-glass"
          }`}
        >
          <Hash size={16} />
          مقارنة بين الرموز
        </button>
        <button
          onClick={() => switchMode("companies")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            mode === "companies"
              ? "bg-accent-soft text-accent-light border border-accent/30"
              : "text-text-muted hover:bg-glass"
          }`}
        >
          <Building2 size={16} />
          مقارنة بين الشركات
        </button>
      </div>

      {/* Loading codes */}
      {loadingCodes ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Loader2 size={28} className="animate-spin-slow text-accent mx-auto" />
          <p className="text-sm text-text-muted mt-3">جاري تحميل قائمة الرموز…</p>
        </div>
      ) : codesWithCompanies.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Inbox size={48} className="mx-auto text-text-muted/30 mb-4" />
          <h2 className="text-lg font-medium text-text-muted mb-2">
            لا توجد رموز قابلة للمقارنة
          </h2>
          <p className="text-sm text-text-muted/70">
            أضف بيانات في نموذج «المتطلب العام» داخل ملف الإكسل أولاً.
          </p>
        </div>
      ) : mode === "codes" ? (
        <CodeVsCodeMode
          codes={codesWithCompanies}
          codeA={codeA}
          codeB={codeB}
          setCodeA={setCodeA}
          setCodeB={setCodeB}
          aggA={aggA}
          aggB={aggB}
          loading={loadingPair}
          onCompare={fetchCodePair}
        />
      ) : (
        <CompanyVsCompanyMode
          codes={codesWithCompanies}
          selectedCode={selectedCode}
          setSelectedCode={setSelectedCode}
          companies={companies}
          loadingCompanies={loadingCompanies}
          companyA={companyA}
          companyB={companyB}
          setCompanyA={setCompanyA}
          setCompanyB={setCompanyB}
          rowA={rowA}
          rowB={rowB}
          loading={loadingCompanyPair}
          onCompare={fetchCompanyPair}
        />
      )}
    </div>
  );
}

/* -------- Mode 1 -------- */

function CodeVsCodeMode({
  codes,
  codeA,
  codeB,
  setCodeA,
  setCodeB,
  aggA,
  aggB,
  loading,
  onCompare,
}: {
  codes: CodeOption[];
  codeA: string;
  codeB: string;
  setCodeA: (v: string) => void;
  setCodeB: (v: string) => void;
  aggA: CodeAggregate | null;
  aggB: CodeAggregate | null;
  loading: boolean;
  onCompare: () => void;
}) {
  const sameCode = codeA && codeB && codeA === codeB;
  const canCompare = codeA && codeB && !sameCode;

  return (
    <>
      <div className="glass-panel rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <CodeSelect
            label="الرمز الأول"
            codes={codes}
            value={codeA}
            onChange={setCodeA}
            disabledCode={codeB}
          />
          <div className="flex items-center justify-center pb-1">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center border border-accent/30">
              <GitCompare size={18} className="text-accent-light" />
            </div>
          </div>
          <CodeSelect
            label="الرمز الثاني"
            codes={codes}
            value={codeB}
            onChange={setCodeB}
            disabledCode={codeA}
          />
        </div>

        {sameCode && (
          <p className="mt-3 text-xs text-amber-400">يجب اختيار رمزين مختلفين.</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onCompare}
            disabled={!canCompare || loading}
            className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent2 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
            قارن
          </button>
        </div>
      </div>

      {aggA && aggB && (
        <ComparisonTable
          headerA={
            <CodeHeader code={aggA.key.capability_code} title={aggA.key.type || aggA.key.capability} subtitle={`${aggA.key.path} • ${aggA.key.capability}`} count={aggA.company_count} />
          }
          headerB={
            <CodeHeader code={aggB.key.capability_code} title={aggB.key.type || aggB.key.capability} subtitle={`${aggB.key.path} • ${aggB.key.capability}`} count={aggB.company_count} />
          }
          rows={[
            {
              label: "المسار",
              valueA: aggA.key.path,
              valueB: aggB.key.path,
            },
            {
              label: "القدرة",
              valueA: aggA.key.capability,
              valueB: aggB.key.capability,
            },
            {
              label: "القدرة الفرعية",
              valueA: aggA.key.sub_capability,
              valueB: aggB.key.sub_capability,
            },
            {
              label: "النوع",
              valueA: aggA.key.type,
              valueB: aggB.key.type,
            },
            {
              label: "عدد الشركات الموردة",
              valueA: String(aggA.company_count),
              valueB: String(aggB.company_count),
            },
            {
              label: "الشركات",
              valueA: aggA.companies.join("، "),
              valueB: aggB.companies.join("، "),
            },
            ...FIELDS.map((f) => ({
              label: f.label,
              valueA: (aggA as unknown as Record<string, string>)[f.key] || "",
              valueB: (aggB as unknown as Record<string, string>)[f.key] || "",
            })),
          ]}
        />
      )}
    </>
  );
}

/* -------- Mode 2 -------- */

function CompanyVsCompanyMode({
  codes,
  selectedCode,
  setSelectedCode,
  companies,
  loadingCompanies,
  companyA,
  companyB,
  setCompanyA,
  setCompanyB,
  rowA,
  rowB,
  loading,
  onCompare,
}: {
  codes: CodeOption[];
  selectedCode: string;
  setSelectedCode: (v: string) => void;
  companies: string[];
  loadingCompanies: boolean;
  companyA: string;
  companyB: string;
  setCompanyA: (v: string) => void;
  setCompanyB: (v: string) => void;
  rowA: CompanyRow | null;
  rowB: CompanyRow | null;
  loading: boolean;
  onCompare: () => void;
}) {
  const sameCompany = companyA && companyB && companyA === companyB;
  const canCompare = selectedCode && companyA && companyB && !sameCompany;

  return (
    <>
      <div className="glass-panel rounded-2xl p-5 space-y-5">
        <CodeSelect
          label="١. اختر رمز القدرة"
          codes={codes}
          value={selectedCode}
          onChange={setSelectedCode}
        />

        {selectedCode && (
          <>
            {loadingCompanies ? (
              <div className="text-center py-6">
                <Loader2 size={22} className="animate-spin-slow text-accent mx-auto" />
                <p className="text-xs text-text-muted mt-2">جاري تحميل الشركات…</p>
              </div>
            ) : companies.length < 2 ? (
              <p className="text-sm text-amber-400">
                هذا الرمز لديه {companies.length} شركة فقط — يلزم وجود شركتين على الأقل للمقارنة.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <CompanySelect
                  label="٢. الشركة الأولى"
                  companies={companies}
                  value={companyA}
                  onChange={setCompanyA}
                  disabledCompany={companyB}
                />
                <div className="flex items-center justify-center pb-1">
                  <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center border border-accent/30">
                    <GitCompare size={18} className="text-accent-light" />
                  </div>
                </div>
                <CompanySelect
                  label="٣. الشركة الثانية"
                  companies={companies}
                  value={companyB}
                  onChange={setCompanyB}
                  disabledCompany={companyA}
                />
              </div>
            )}
          </>
        )}

        {sameCompany && (
          <p className="text-xs text-amber-400">يجب اختيار شركتين مختلفتين.</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={onCompare}
            disabled={!canCompare || loading}
            className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent2 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
            قارن
          </button>
        </div>
      </div>

      {rowA && rowB && (
        <ComparisonTable
          headerA={
            <CompanyHeader
              company={rowA.company_name}
              code={rowA.key.capability_code}
              type={rowA.key.type}
            />
          }
          headerB={
            <CompanyHeader
              company={rowB.company_name}
              code={rowB.key.capability_code}
              type={rowB.key.type}
            />
          }
          rows={COMPANY_FIELDS.map((f) => ({
            label: f.label,
            valueA: rowA[f.key] || "",
            valueB: rowB[f.key] || "",
          }))}
        />
      )}
    </>
  );
}

/* -------- Reusable bits -------- */

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  mono?: boolean;
}

function CustomDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="block" ref={containerRef}>
      <span className="text-xs font-medium text-text-muted block mb-1.5">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full bg-bg-card border border-line rounded-xl px-3 py-2.5 text-sm text-right flex items-center justify-between gap-2 hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${
            open ? "border-accent ring-2 ring-accent/30" : ""
          } ${mono ? "font-mono" : ""}`}
        >
          <span className={selected ? "text-text" : "text-text-muted/60"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-accent/30 bg-bg-card shadow-2xl shadow-black/50 backdrop-blur-xl py-1.5">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-text-muted/60 text-center">
                لا توجد خيارات
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                      opt.disabled
                        ? "text-text-muted/30 cursor-not-allowed"
                        : isSelected
                        ? "bg-accent text-white font-bold"
                        : "text-text hover:bg-accent-soft hover:text-accent-light cursor-pointer"
                    } ${mono ? "font-mono" : ""}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="shrink-0" />}
                    {opt.disabled && !isSelected && (
                      <span className="text-[10px] opacity-60">مُختار</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CodeSelect({
  label,
  codes,
  value,
  onChange,
  disabledCode,
}: {
  label: string;
  codes: CodeOption[];
  value: string;
  onChange: (v: string) => void;
  disabledCode?: string;
}) {
  const options: DropdownOption[] = codes.map((c) => ({
    value: c.capability_code,
    label: c.capability_code,
    disabled: c.capability_code === disabledCode,
    mono: true,
  }));
  return (
    <CustomDropdown
      label={label}
      placeholder="— اختر رمزاً —"
      options={options}
      value={value}
      onChange={onChange}
      mono
    />
  );
}

function CompanySelect({
  label,
  companies,
  value,
  onChange,
  disabledCompany,
}: {
  label: string;
  companies: string[];
  value: string;
  onChange: (v: string) => void;
  disabledCompany?: string;
}) {
  const options: DropdownOption[] = companies.map((c) => ({
    value: c,
    label: c,
    disabled: c === disabledCompany,
  }));
  return (
    <CustomDropdown
      label={label}
      placeholder="— اختر شركة —"
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}

function CodeHeader({
  code,
  title,
  subtitle,
  count,
}: {
  code: string;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono text-accent-light/70">{code}</div>
      <div className="text-base font-bold text-text">{title}</div>
      <div className="text-[11px] text-text-muted">{subtitle}</div>
      <div className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-accent-soft/40 text-accent-light border border-accent/20 mt-1">
        {count} شركة موردة
      </div>
    </div>
  );
}

function CompanyHeader({
  company,
  code,
  type,
}: {
  company: string;
  code: string;
  type: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-base font-bold text-text">{company}</div>
      <div className="text-[11px] text-text-muted">{type}</div>
      <div className="text-[10px] font-mono text-accent-light/70 mt-1">{code}</div>
    </div>
  );
}

function ComparisonTable({
  headerA,
  headerB,
  rows,
}: {
  headerA: React.ReactNode;
  headerB: React.ReactNode;
  rows: { label: string; valueA: string; valueB: string }[];
}) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[160px_1fr_1fr] border-b border-line bg-glass">
        <div className="px-4 py-4 text-xs font-medium text-text-muted">الحقل</div>
        <div className="px-4 py-4 border-r border-line">{headerA}</div>
        <div className="px-4 py-4 border-r border-line">{headerB}</div>
      </div>
      {rows.map((row, i) => {
        const same = row.valueA && row.valueB && row.valueA === row.valueB;
        return (
          <div
            key={i}
            className={`grid grid-cols-[160px_1fr_1fr] border-b border-line/40 ${
              same ? "bg-accent-soft/10" : ""
            }`}
          >
            <div className="px-4 py-3 text-xs font-bold text-text-muted bg-glass/40">
              {row.label}
            </div>
            <CompareCell value={row.valueA} other={row.valueB} />
            <CompareCell value={row.valueB} other={row.valueA} />
          </div>
        );
      })}
    </div>
  );
}

function CompareCell({ value, other }: { value: string; other: string }) {
  const empty = !value || value.trim() === "";
  const sameAsOther = !empty && value === other;
  return (
    <div
      className={`px-4 py-3 text-sm leading-relaxed border-r border-line/40 whitespace-pre-wrap break-words ${
        empty
          ? "text-text-muted/40 italic"
          : sameAsOther
          ? "text-text"
          : "text-text"
      }`}
    >
      {empty ? "—" : value}
    </div>
  );
}
