"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface CapabilityModalProps {
  data: Record<string, unknown>;
  onClose: () => void;
}

const fieldLabels: Record<string, string> = {
  capability_code: "رمز القدرة",
  path: "المسار",
  capability: "القدرة",
  sub_capability: "القدرة الفرعية",
  type: "النوع",
  definition: "تعريف القدرة",
  operational_requirements: "المتطلبات العملياتية",
  scenarios: "سيناريوهات التجارب",
  sub_elements: "العناصر الفرعية",
  units_used: "الوحدات المستخدمة",
  local_entities: "الجهات المحلية",
  manufacturers: "الشركات المصنعة",
  capability_name: "اسم القدرة",
  company_name: "اسم الشركة",
  company_info: "تعريف بالشركة",
  scope_definition: "نطاق التعريف",
  development_history: "تاريخ التطوير",
  armament: "التسليح والذخائر",
  cost: "التكلفة",
  family: "عائلة القدرة",
  technical_specs: "المواصفات الفنية",
  countries_used: "الدول المستخدمة",
  training_requirements: "متطلبات التدريب",
  localization_status: "حالة التوطين",
  system_formation: "تشكيل المنظومة",
  factory_tests: "الاختبارات المصنعية",
  storage_requirements: "متطلبات التخزين",
  sub_systems: "الأنظمة الفرعية",
  conflict_participation: "المشاركة في النزاعات",
};

export default function CapabilityModal({ data, onClose }: CapabilityModalProps) {
  const [fullData, setFullData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const code = data.capability_code;
    if (!code) {
      setFullData(data);
      return;
    }
    fetch(`/api/data?action=detail&code=${encodeURIComponent(String(code))}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setFullData({ ...res.key, ...res.special, ...res.general });
        } else {
          setFullData(data);
        }
      })
      .catch(() => setFullData(data));
  }, [data]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const display = fullData || data;
  const entries = Object.entries(display).filter(
    ([key, val]) => key !== "id" && key !== "rank" && val && String(val).trim()
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg text-primary">
            {String(display.capability_code || "تفاصيل القدرة")}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {!fullData ? (
            <div className="text-center py-8 text-muted">جاري التحميل...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted">لا توجد بيانات تفصيلية</div>
          ) : (
            entries.map(([key, val]) => (
              <div key={key} className="flex gap-3">
                <span className="text-sm font-medium text-muted min-w-[140px] shrink-0">
                  {fieldLabels[key] || key}
                </span>
                <span className="text-sm leading-relaxed">{String(val)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
