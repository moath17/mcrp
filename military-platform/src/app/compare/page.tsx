"use client";

import { useState, useEffect } from "react";
import { GitCompareArrows, Plus, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface CapabilityOption {
  capability_code: string;
  capability: string;
  type: string;
}

interface CompareField {
  key: string;
  label: string;
}

const compareFields: CompareField[] = [
  { key: "capability_code", label: "رمز القدرة" },
  { key: "capability", label: "القدرة" },
  { key: "sub_capability", label: "القدرة الفرعية" },
  { key: "type", label: "النوع" },
  { key: "path", label: "المسار" },
  { key: "definition", label: "تعريف القدرة" },
  { key: "operational_requirements", label: "المتطلبات العملياتية" },
  { key: "capability_name", label: "اسم القدرة" },
  { key: "company_name", label: "الشركة" },
  { key: "scope_definition", label: "نطاق التعريف" },
  { key: "armament", label: "التسليح" },
  { key: "cost", label: "التكلفة" },
  { key: "technical_specs", label: "المواصفات الفنية" },
  { key: "countries_used", label: "الدول المستخدمة" },
  { key: "localization_status", label: "حالة التوطين" },
  { key: "training_requirements", label: "متطلبات التدريب" },
  { key: "storage_requirements", label: "متطلبات التخزين" },
  { key: "conflict_participation", label: "المشاركة في النزاعات" },
];

export default function ComparePage() {
  const [options, setOptions] = useState<CapabilityOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/data?action=codes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOptions(data.codes);
      });
  }, []);

  const addCapability = (code: string) => {
    if (!selected.includes(code) && selected.length < 5) {
      setSelected([...selected, code]);
    }
    setSearchTerm("");
  };

  const removeCapability = (code: string) => {
    setSelected(selected.filter((c) => c !== code));
    setResults([]);
  };

  const doCompare = () => {
    if (selected.length < 2) return;
    setLoading(true);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes: selected }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setResults(data.results);
      })
      .finally(() => setLoading(false));
  };

  const filtered = searchTerm
    ? options.filter(
        (o) =>
          o.capability_code.includes(searchTerm) ||
          o.capability.includes(searchTerm) ||
          o.type.includes(searchTerm)
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">المقارنات</h1>
        <p className="text-sm text-muted mt-1">
          قارن بين القدرات العسكرية جنباً إلى جنب
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <GitCompareArrows size={18} />
            <span>اختر القدرات للمقارنة (2-5)</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted hover:text-primary"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {expanded && (
          <>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن قدرة لإضافتها..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {searchTerm && filtered.length > 0 && (
                <div className="absolute top-full mt-1 right-0 left-0 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {filtered.slice(0, 20).map((opt) => (
                    <button
                      key={opt.capability_code}
                      onClick={() => addCapability(opt.capability_code)}
                      disabled={selected.includes(opt.capability_code)}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-primary-50/50 disabled:opacity-40 disabled:cursor-not-allowed border-b border-border/50 last:border-0 flex items-center justify-between"
                    >
                      <span>
                        {opt.capability_code} — {opt.capability}
                      </span>
                      {!selected.includes(opt.capability_code) && (
                        <Plus size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary text-sm rounded-lg"
                  >
                    {code}
                    <button onClick={() => removeCapability(code)} className="hover:text-danger">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={doCompare}
              disabled={selected.length < 2 || loading}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin-slow" /> : <GitCompareArrows size={16} />}
              مقارنة
            </button>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50/50 border-b border-border">
                  <th className="px-4 py-3 text-right font-medium text-muted min-w-[160px] sticky right-0 bg-primary-50/50">
                    المعيار
                  </th>
                  {results.map((r) => (
                    <th
                      key={String(r.capability_code)}
                      className="px-4 py-3 text-right font-medium text-primary min-w-[200px]"
                    >
                      {String(r.capability_code)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFields.map((field) => {
                  const values = results.map((r) => String(r[field.key] || ""));
                  const allSame = values.every((v) => v === values[0]);
                  const hasData = values.some((v) => v && v !== "—" && v !== "undefined");
                  if (!hasData) return null;

                  return (
                    <tr key={field.key} className="border-b border-border/50 hover:bg-background">
                      <td className="px-4 py-3 font-medium text-muted sticky right-0 bg-surface">
                        {field.label}
                      </td>
                      {results.map((r, idx) => {
                        const val = String(r[field.key] || "—");
                        return (
                          <td
                            key={idx}
                            className={`px-4 py-3 ${
                              !allSame && val !== "—" ? "bg-primary-50/20" : ""
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && selected.length >= 2 && !loading && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <p className="text-muted text-sm">اضغط &quot;مقارنة&quot; لعرض النتائج</p>
        </div>
      )}
    </div>
  );
}
