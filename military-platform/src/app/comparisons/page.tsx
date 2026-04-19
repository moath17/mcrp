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
  FileText,
  Cpu,
  Wallet,
  Globe,
  GraduationCap,
  Shield,
  Users,
  FlaskConical,
  Package,
  Network,
  Swords,
  Calendar,
  Layers,
  Crosshair,
  type LucideIcon,
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
  companyRows: Record<string, string>[];
}

type CompanyRow = Record<string, string> & { key: Record<string, string> };

type FieldValue =
  | { kind: "single"; value: string }
  | { kind: "perCompany"; entries: { company: string; value: string }[] };

interface FieldDef {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface FieldGroup {
  title: string;
  icon: LucideIcon;
  color: string;
  fields: FieldDef[];
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "التعريف والنظرة العامة",
    icon: FileText,
    color: "from-blue-500/30 to-cyan-500/20",
    fields: [
      { key: "capability_name", label: "اسم القدرة", icon: Crosshair },
      { key: "scope_definition", label: "نطاق التعريف للقدرة", icon: FileText },
      { key: "development_history", label: "تاريخ التطوير", icon: Calendar },
      { key: "family", label: "عائلة القدرة والأنواع المتاحة", icon: Layers },
    ],
  },
  {
    title: "المواصفات الفنية والتسليح",
    icon: Cpu,
    color: "from-purple-500/30 to-pink-500/20",
    fields: [
      { key: "technical_specs", label: "المواصفات الفنية", icon: Cpu },
      { key: "armament", label: "التسليح والذخائر", icon: Crosshair },
      { key: "sub_systems", label: "الأنظمة الفرعية المرتبطة", icon: Network },
    ],
  },
  {
    title: "التكلفة والتوطين",
    icon: Wallet,
    color: "from-amber-500/30 to-orange-500/20",
    fields: [
      { key: "cost", label: "تكلفة القدرة", icon: Wallet },
      { key: "localization_status", label: "حالة التوطين", icon: Shield },
    ],
  },
  {
    title: "الاستخدام والتدريب",
    icon: Users,
    color: "from-emerald-500/30 to-teal-500/20",
    fields: [
      { key: "countries_used", label: "الدول والقوات المستخدمة", icon: Globe },
      { key: "system_formation", label: "تشكيل المنظومة", icon: Users },
      { key: "training_requirements", label: "متطلبات التدريب", icon: GraduationCap },
    ],
  },
  {
    title: "الاختبارات والتخزين والنزاعات",
    icon: FlaskConical,
    color: "from-rose-500/30 to-red-500/20",
    fields: [
      { key: "factory_tests", label: "الاختبارات المصنعية", icon: FlaskConical },
      { key: "storage_requirements", label: "متطلبات التخزين والاستدامة", icon: Package },
      { key: "conflict_participation", label: "مشاركة القدرة في النزاعات", icon: Swords },
    ],
  },
];

// Flat list for company-level comparison (includes company-specific fields at top)
const COMPANY_FIELD_GROUPS: FieldGroup[] = [
  {
    title: "بيانات الشركة",
    icon: Building2,
    color: "from-indigo-500/30 to-blue-500/20",
    fields: [
      { key: "company_name", label: "اسم الشركة", icon: Building2 },
      { key: "company_info", label: "تعريف بالشركة", icon: FileText },
    ],
  },
  ...FIELD_GROUPS,
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
        <div className="space-y-6">
          <CodeHeroVS aggA={aggA} aggB={aggB} />
          <ComparisonGroups
            data={FIELD_GROUPS}
            valueA={(k) => extractCodeField(aggA, k)}
            valueB={(k) => extractCodeField(aggB, k)}
          />
        </div>
      )}
    </>
  );
}

function extractCodeField(agg: CodeAggregate, key: string): FieldValue {
  if (key in agg.key) {
    return { kind: "single", value: agg.key[key] || "" };
  }
  const entries = agg.companyRows.map((r) => ({
    company: r.company_name || "غير محدد",
    value: r[key] || "",
  }));
  return { kind: "perCompany", entries };
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
        <div className="space-y-6">
          <CompanyHeroVS rowA={rowA} rowB={rowB} />
          <ComparisonGroups
            data={COMPANY_FIELD_GROUPS}
            valueA={(k) => ({ kind: "single", value: rowA[k] || "" })}
            valueB={(k) => ({ kind: "single", value: rowB[k] || "" })}
          />
        </div>
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

/* -------- VS Hero (Code mode) -------- */

function CodeHeroVS({ aggA, aggB }: { aggA: CodeAggregate; aggB: CodeAggregate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
      <SubjectCard
        side="A"
        gradient="from-blue-600 via-blue-700 to-cyan-800"
        title={aggA.key.type || aggA.key.capability}
        subtitle={`${aggA.key.path} • ${aggA.key.capability}`}
        code={aggA.key.capability_code}
        badges={[
          { label: `${aggA.company_count} شركة موردة`, icon: Building2 },
          { label: aggA.key.sub_capability || "—", icon: Network },
        ]}
        icon={Crosshair}
      />
      <VSDivider />
      <SubjectCard
        side="B"
        gradient="from-purple-600 via-purple-700 to-pink-800"
        title={aggB.key.type || aggB.key.capability}
        subtitle={`${aggB.key.path} • ${aggB.key.capability}`}
        code={aggB.key.capability_code}
        badges={[
          { label: `${aggB.company_count} شركة موردة`, icon: Building2 },
          { label: aggB.key.sub_capability || "—", icon: Network },
        ]}
        icon={Crosshair}
      />
    </div>
  );
}

function CompanyHeroVS({ rowA, rowB }: { rowA: CompanyRow; rowB: CompanyRow }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
      <SubjectCard
        side="A"
        gradient="from-emerald-600 via-teal-700 to-cyan-800"
        title={rowA.company_name}
        subtitle={rowA.key.type}
        code={rowA.key.capability_code}
        badges={[
          { label: rowA.localization_status || "—", icon: Shield },
          { label: rowA.cost || "—", icon: Wallet },
        ]}
        icon={Building2}
      />
      <VSDivider />
      <SubjectCard
        side="B"
        gradient="from-orange-600 via-amber-700 to-red-800"
        title={rowB.company_name}
        subtitle={rowB.key.type}
        code={rowB.key.capability_code}
        badges={[
          { label: rowB.localization_status || "—", icon: Shield },
          { label: rowB.cost || "—", icon: Wallet },
        ]}
        icon={Building2}
      />
    </div>
  );
}

function SubjectCard({
  side,
  gradient,
  title,
  subtitle,
  code,
  badges,
  icon: Icon,
}: {
  side: "A" | "B";
  gradient: string;
  title: string;
  subtitle: string;
  code: string;
  badges: { label: string; icon: LucideIcon }[];
  icon: LucideIcon;
}) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} p-5 shadow-xl`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,0,0,0.25),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/80 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm">
                {side}
              </span>
              <span className="text-[10px] font-mono text-white/80 truncate">{code}</span>
            </div>
            <h3 className="text-lg font-black text-white mt-1.5 leading-tight">{title}</h3>
            <p className="text-[11px] text-white/75 mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {badges.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-sm border border-white/15"
            >
              <b.icon size={12} />
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VSDivider() {
  return (
    <div className="flex items-center justify-center md:py-0 py-2">
      <div className="relative w-12 h-12 rounded-full bg-bg-card border-2 border-accent/40 flex items-center justify-center shadow-lg">
        <span className="text-xs font-black text-accent-light">VS</span>
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-40" />
      </div>
    </div>
  );
}

/* -------- Comparison Groups -------- */

function ComparisonGroups({
  data,
  valueA,
  valueB,
}: {
  data: FieldGroup[];
  valueA: (key: string) => FieldValue;
  valueB: (key: string) => FieldValue;
}) {
  return (
    <div className="space-y-5">
      {data.map((group) => (
        <ComparisonGroup
          key={group.title}
          group={group}
          valueA={valueA}
          valueB={valueB}
        />
      ))}
    </div>
  );
}

function ComparisonGroup({
  group,
  valueA,
  valueB,
}: {
  group: FieldGroup;
  valueA: (key: string) => FieldValue;
  valueB: (key: string) => FieldValue;
}) {
  const GroupIcon = group.icon;
  return (
    <section className="rounded-2xl overflow-hidden border border-line bg-bg-soft">
      {/* Group header */}
      <div className={`flex items-center gap-3 px-5 py-3.5 bg-gradient-to-l ${group.color} border-b border-line/60`}>
        <div className="w-9 h-9 rounded-xl bg-bg-card/70 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <GroupIcon size={18} className="text-text" />
        </div>
        <h3 className="text-sm font-black text-text">{group.title}</h3>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        {group.fields.map((field) => (
          <FieldComparison
            key={field.key}
            field={field}
            valueA={valueA(field.key)}
            valueB={valueB(field.key)}
          />
        ))}
      </div>
    </section>
  );
}

function flattenValue(v: FieldValue): string {
  if (v.kind === "single") return (v.value || "").trim();
  return v.entries
    .map((e) => `${e.company}|||${(e.value || "").trim()}`)
    .join("###");
}

function isValueEmpty(v: FieldValue): boolean {
  if (v.kind === "single") return !v.value || v.value.trim() === "";
  return v.entries.every((e) => !e.value || e.value.trim() === "");
}

function FieldComparison({
  field,
  valueA,
  valueB,
}: {
  field: FieldDef;
  valueA: FieldValue;
  valueB: FieldValue;
}) {
  const FieldIcon = field.icon;
  const aEmpty = isValueEmpty(valueA);
  const bEmpty = isValueEmpty(valueB);
  const same = !aEmpty && !bEmpty && flattenValue(valueA) === flattenValue(valueB);

  return (
    <div className="rounded-xl bg-bg-card/40 border border-line/60 overflow-hidden">
      {/* Field label header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-glass/60 border-b border-line/50">
        <div className="flex items-center gap-2">
          <FieldIcon size={14} className="text-accent-light/80" />
          <span className="text-xs font-bold text-text">{field.label}</span>
        </div>
        {same ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Check size={10} />
            متطابق
          </span>
        ) : aEmpty || bEmpty ? null : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            مختلف
          </span>
        )}
      </div>

      {/* Two values */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-line/40">
        <ValueBlock value={valueA} side="A" />
        <ValueBlock value={valueB} side="B" />
      </div>
    </div>
  );
}

function ValueBlock({ value, side }: { value: FieldValue; side: "A" | "B" }) {
  const empty = isValueEmpty(value);
  const badgeStyle =
    side === "A"
      ? "bg-blue-500/15 text-blue-300 border-blue-500/40"
      : "bg-purple-500/15 text-purple-300 border-purple-500/40";

  return (
    <div className="px-4 py-3">
      <div
        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black border mb-2.5 ${badgeStyle}`}
      >
        {side}
      </div>

      {empty ? (
        <p className="text-xs text-text-muted/40 italic">لا توجد بيانات</p>
      ) : value.kind === "single" ? (
        <p className="text-sm text-text leading-relaxed whitespace-pre-wrap break-words">
          {value.value}
        </p>
      ) : (
        <PerCompanyList entries={value.entries} side={side} />
      )}
    </div>
  );
}

function PerCompanyList({
  entries,
  side,
}: {
  entries: { company: string; value: string }[];
  side: "A" | "B";
}) {
  const tagStyle =
    side === "A"
      ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
      : "bg-purple-500/10 text-purple-300 border-purple-500/30";

  const valid = entries.filter((e) => e.value && e.value.trim() !== "");
  if (valid.length === 0) {
    return <p className="text-xs text-text-muted/40 italic">لا توجد بيانات</p>;
  }

  return (
    <ul className="space-y-2.5">
      {valid.map((entry, i) => (
        <li
          key={i}
          className="rounded-lg bg-bg-card/70 border border-line/50 overflow-hidden"
        >
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border-b border-line/40 ${tagStyle}`}
          >
            <Building2 size={11} />
            <span className="truncate">{entry.company}</span>
          </div>
          <p className="px-3 py-2 text-sm text-text leading-relaxed whitespace-pre-wrap break-words">
            {entry.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
