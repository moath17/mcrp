"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  FileText,
  Target,
  FlaskConical,
  Network,
  Building2,
  MapPin,
  Factory,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SubElementsTree from "@/components/SubElementsTree";
import UnitCard from "@/components/UnitCard";
import { getPathBySlug } from "@/lib/paths-config";

interface TypeData {
  key: {
    capability_code: string;
    path: string;
    capability: string;
    sub_capability: string;
    type: string;
  } | null;
  special: {
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

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-text">{title}</h2>
      </div>
      <div className="pr-[52px]">{children}</div>
    </div>
  );
}

export default function TypeDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const code = decodeURIComponent(params.code as string);
  const pathConfig = getPathBySlug(slug);

  const [data, setData] = useState<TypeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data?action=detail&code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success !== false) setData(res);
      })
      .finally(() => setLoading(false));
  }, [code]);

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
            { label: pathConfig?.name || slug, href: `/path/${encodeURIComponent(slug)}` },
            { label: code },
          ]}
        />
        <div className="glass-panel rounded-2xl p-12 text-center">
          <h2 className="text-lg font-medium text-text-muted">لم يتم العثور على البيانات</h2>
        </div>
      </div>
    );
  }

  const { key, special } = data;

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          { label: pathConfig?.name || slug, href: `/path/${encodeURIComponent(slug)}` },
          { label: key.capability || key.type || code },
        ]}
      />

      {/* Type Header */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shrink-0">
            <FileText size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text">
              {key.type || key.capability_code}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {key.capability && (
                <span className="text-xs px-3 py-1 rounded-full bg-accent-soft text-accent-light border border-accent/20">
                  {key.capability}
                </span>
              )}
              {key.sub_capability && (
                <span className="text-xs px-3 py-1 rounded-full bg-accent2-soft text-accent2 border border-accent2/20">
                  {key.sub_capability}
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full bg-glass text-text-muted border border-line">
                {key.capability_code}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Requirements Sections */}
      {special && (
        <div className="space-y-4">
          {special.definition && (
            <Section
              icon={<FileText size={20} className="text-accent-light" />}
              title="تعريف القدرة"
            >
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {special.definition}
              </p>
            </Section>
          )}

          {special.operational_requirements && (
            <Section
              icon={<Target size={20} className="text-accent-light" />}
              title="المتطلب العملياتي"
            >
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {special.operational_requirements}
              </p>
            </Section>
          )}

          {special.scenarios && (
            <Section
              icon={<FlaskConical size={20} className="text-accent-light" />}
              title="سيناريوهات ومتطلبات التجارب"
            >
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {special.scenarios}
              </p>
            </Section>
          )}

          {special.sub_elements && (
            <Section
              icon={<Network size={20} className="text-accent-light" />}
              title="العناصر الفرعية المكونة للقدرة"
            >
              <SubElementsTree data={special.sub_elements} />
            </Section>
          )}

          {special.units_used && (
            <Section
              icon={<Building2 size={20} className="text-accent-light" />}
              title="الوحدات المستخدمة للقدرة"
            >
              <UnitCard data={special.units_used} />
            </Section>
          )}

          {special.local_entities && (
            <Section
              icon={<MapPin size={20} className="text-accent-light" />}
              title="الجهات المحلية المستخدمة للقدرة"
            >
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {special.local_entities}
              </p>
            </Section>
          )}

          {special.manufacturers && (
            <Section
              icon={<Factory size={20} className="text-accent-light" />}
              title="الشركات المصنعة للقدرة (العالمية)"
            >
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {special.manufacturers}
              </p>
            </Section>
          )}
        </div>
      )}

      {!special && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <h2 className="text-lg font-medium text-text-muted">
            لا توجد متطلبات خاصة لهذا النوع
          </h2>
        </div>
      )}
    </div>
  );
}
