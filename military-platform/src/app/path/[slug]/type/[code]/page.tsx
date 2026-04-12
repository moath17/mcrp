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
  Hash,
  Tag,
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

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  colNumber: number;
}

function Section({ icon, title, children, colNumber }: SectionProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text">{title}</h2>
        </div>
        <span className="text-[10px] text-text-muted/50 px-2 py-0.5 rounded bg-glass border border-line">
          عمود {colNumber}
        </span>
      </div>
      <div className="pr-2 sm:pr-[52px]">{children}</div>
    </div>
  );
}

function EmptyField() {
  return (
    <p className="text-sm text-text-muted/40 italic">
      لا توجد بيانات حالياً — سيتم تعبئتها لاحقاً
    </p>
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

  const specialFields = [
    {
      key: "capability_code",
      title: "رمز القدرة",
      icon: <Hash size={20} className="text-accent-light" />,
      col: 1,
      value: special?.capability_code || key.capability_code,
      type: "text" as const,
    },
    {
      key: "type",
      title: "النوع",
      icon: <Tag size={20} className="text-accent-light" />,
      col: 2,
      value: special?.type || key.type,
      type: "text" as const,
    },
    {
      key: "definition",
      title: "تعريف القدرة",
      icon: <FileText size={20} className="text-accent-light" />,
      col: 3,
      value: special?.definition || "",
      type: "paragraph" as const,
    },
    {
      key: "operational_requirements",
      title: "المتطلبات العملياتية",
      icon: <Target size={20} className="text-accent-light" />,
      col: 4,
      value: special?.operational_requirements || "",
      type: "paragraph" as const,
    },
    {
      key: "scenarios",
      title: "سيناريوهات ومتطلبات التجارب",
      icon: <FlaskConical size={20} className="text-accent-light" />,
      col: 5,
      value: special?.scenarios || "",
      type: "paragraph" as const,
    },
    {
      key: "sub_elements",
      title: "العناصر الفرعية المكونة للقدرة",
      icon: <Network size={20} className="text-accent-light" />,
      col: 6,
      value: special?.sub_elements || "",
      type: "tree" as const,
    },
    {
      key: "units_used",
      title: "الوحدات المستخدمة للقدرة",
      icon: <Building2 size={20} className="text-accent-light" />,
      col: 7,
      value: special?.units_used || "",
      type: "units" as const,
    },
    {
      key: "local_entities",
      title: "الجهات المحلية المستخدمة للقدرة",
      icon: <MapPin size={20} className="text-accent-light" />,
      col: 8,
      value: special?.local_entities || "",
      type: "paragraph" as const,
    },
    {
      key: "manufacturers",
      title: "الشركات المصنعة للقدرة (العالمية)",
      icon: <Factory size={20} className="text-accent-light" />,
      col: 9,
      value: special?.manufacturers || "",
      type: "paragraph" as const,
    },
  ];

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          { label: pathConfig?.name || slug, href: `/path/${encodeURIComponent(slug)}` },
          { label: key.type || key.capability_code },
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
            <p className="text-xs text-text-muted/60 mt-3">
              نموذج عام - متطلب خاص &bull; {specialFields.length} أعمدة
            </p>
          </div>
        </div>
      </div>

      {/* All 9 Special Requirements columns */}
      <div className="space-y-4">
        {specialFields.map((field) => (
          <Section
            key={field.key}
            icon={field.icon}
            title={field.title}
            colNumber={field.col}
          >
            {!field.value || field.value.trim() === "" ? (
              <EmptyField />
            ) : field.type === "text" ? (
              <p className="text-sm text-text font-medium">{field.value}</p>
            ) : field.type === "paragraph" ? (
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {field.value}
              </p>
            ) : field.type === "tree" ? (
              <SubElementsTree data={field.value} />
            ) : field.type === "units" ? (
              <UnitCard data={field.value} />
            ) : null}
          </Section>
        ))}
      </div>
    </div>
  );
}
