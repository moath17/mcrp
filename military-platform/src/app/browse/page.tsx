"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import DataTable from "@/components/DataTable";
import FilterPanel from "@/components/FilterPanel";

const columns = [
  { key: "capability_code", label: "رمز القدرة" },
  { key: "capability", label: "القدرة" },
  { key: "sub_capability", label: "القدرة الفرعية" },
  { key: "type", label: "النوع" },
  { key: "path", label: "المسار" },
  { key: "company_name", label: "الشركة" },
  { key: "cost", label: "التكلفة" },
  { key: "localization_status", label: "التوطين" },
];

export default function BrowsePage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = (filters: Record<string, string> = {}) => {
    setLoading(true);
    const params = new URLSearchParams(filters);
    fetch(`/api/data?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.results);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">تصفح البيانات</h1>
        <p className="text-sm text-muted mt-1">عرض وتصفية جميع القدرات العسكرية</p>
      </div>

      <FilterPanel onFilterChange={loadData} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin-slow text-primary" />
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">إجمالي النتائج: {data.length}</p>
          <DataTable columns={columns} data={data} />
        </>
      )}
    </div>
  );
}
