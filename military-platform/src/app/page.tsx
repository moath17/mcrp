"use client";

import { useEffect, useState } from "react";
import { Database, Layers, Route, Building2, Loader2 } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { BarChartCard, PieChartCard } from "@/components/Charts";

interface Stats {
  totalCapabilities: number;
  totalTypes: number;
  totalPaths: number;
  totalCompanies: number;
  byPath: { path: string; count: number }[];
  byType: { type: string; count: number }[];
  byCapability: { capability: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/init", { method: "POST" })
      .then(() => fetch("/api/stats"))
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin-slow text-primary" />
      </div>
    );
  }

  const isEmpty = !stats || stats.totalCapabilities === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">لوحة المعلومات</h1>
        <p className="text-sm text-muted mt-1">نظرة عامة على بيانات القدرات العسكرية</p>
      </div>

      {isEmpty ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Database size={48} className="mx-auto text-muted/30 mb-4" />
          <h2 className="text-lg font-medium text-muted mb-2">لا توجد بيانات</h2>
          <p className="text-sm text-muted/70 mb-4">
            قم برفع ملف Excel لبدء استخدام المنصة
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-light transition-colors"
          >
            رفع ملف Excel
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="إجمالي القدرات"
              value={stats.totalCapabilities}
              icon={Database}
            />
            <StatsCard
              title="الأنواع"
              value={stats.totalTypes}
              icon={Layers}
            />
            <StatsCard
              title="المسارات"
              value={stats.totalPaths}
              icon={Route}
            />
            <StatsCard
              title="الشركات"
              value={stats.totalCompanies}
              icon={Building2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard
              title="التوزيع حسب المسار"
              data={(stats.byPath || []).map((item) => ({
                name: item.path,
                count: item.count,
              }))}
            />
            <BarChartCard
              title="التوزيع حسب القدرة (أعلى 10)"
              data={(stats.byCapability || []).slice(0, 10).map((item) => ({
                name: item.capability,
                count: item.count,
              }))}
            />
          </div>

          {stats.byType && stats.byType.length > 0 && stats.byType.length <= 20 && (
            <BarChartCard
              title="التوزيع حسب النوع"
              data={stats.byType.slice(0, 15).map((item) => ({
                name: item.type,
                count: item.count,
              }))}
            />
          )}
        </>
      )}
    </div>
  );
}
