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
  type LucideIcon,
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
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-text">{title}</h2>
        </div>
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

interface ImageSectionCardProps {
  icon: LucideIcon;
  title: string;
  gradient: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

function ImageSectionCard({
  icon: Icon,
  title,
  gradient,
  isEmpty,
  children,
}: ImageSectionCardProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Hero "image" area */}
      <div className={`relative h-[140px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.25),transparent_55%)]" />
        <Icon size={56} className="text-white/95 drop-shadow-lg relative z-10" strokeWidth={1.5} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/40 via-transparent to-transparent" />
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-text mb-2">{title}</h3>
        <div className="flex-1">
          {isEmpty ? (
            <p className="text-xs text-text-muted/50 italic leading-relaxed">
              لا توجد بيانات حالياً — سيتم تعبئتها لاحقاً
            </p>
          ) : (
            children
          )}
        </div>
      </div>
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
            { label: "تفاصيل النوع" },
          ]}
        />
        <div className="glass-panel rounded-2xl p-12 text-center">
          <h2 className="text-lg font-medium text-text-muted">لم يتم العثور على البيانات</h2>
        </div>
      </div>
    );
  }

  const { key, special } = data;

  const mainFields = [
    {
      key: "definition",
      title: "تعريف القدرة",
      icon: <FileText size={20} className="text-accent-light" />,
      value: special?.definition || "",
      type: "paragraph" as const,
    },
    {
      key: "operational_requirements",
      title: "المتطلبات العملياتية",
      icon: <Target size={20} className="text-accent-light" />,
      value: special?.operational_requirements || "",
      type: "paragraph" as const,
    },
    {
      key: "scenarios",
      title: "سيناريوهات ومتطلبات التجارب",
      icon: <FlaskConical size={20} className="text-accent-light" />,
      value: special?.scenarios || "",
      type: "paragraph" as const,
    },
    {
      key: "sub_elements",
      title: "العناصر الفرعية المكونة للقدرة",
      icon: <Network size={20} className="text-accent-light" />,
      value: special?.sub_elements || "",
      type: "tree" as const,
    },
  ];

  const imageCardFields = [
    {
      key: "units_used",
      title: "الوحدات المستخدمة للقدرة",
      icon: Building2,
      gradient: "from-blue-600 to-cyan-700",
      value: special?.units_used || "",
      type: "units" as const,
    },
    {
      key: "local_entities",
      title: "الجهات المحلية المستخدمة للقدرة",
      icon: MapPin,
      gradient: "from-emerald-600 to-teal-700",
      value: special?.local_entities || "",
      type: "paragraph" as const,
    },
    {
      key: "manufacturers",
      title: "الشركات المصنعة للقدرة (العالمية)",
      icon: Factory,
      gradient: "from-amber-600 to-orange-700",
      value: special?.manufacturers || "",
      type: "paragraph" as const,
    },
  ];

  return (
    <div className="animate-fade-in">
      <Breadcrumb
        items={[
          { label: pathConfig?.name || slug, href: `/path/${encodeURIComponent(slug)}` },
          { label: key.type || key.sub_capability || key.capability || "تفاصيل النوع" },
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
              {key.type || key.sub_capability || key.capability || "تفاصيل النوع"}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main full-width sections */}
      <div className="space-y-4">
        {mainFields.map((field) => (
          <Section
            key={field.key}
            icon={field.icon}
            title={field.title}
          >
            {!field.value || field.value.trim() === "" ? (
              <EmptyField />
            ) : field.type === "paragraph" ? (
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {field.value}
              </p>
            ) : field.type === "tree" ? (
              <SubElementsTree data={field.value} />
            ) : null}
          </Section>
        ))}
      </div>

      {/* Image cards row — 3 sections side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {imageCardFields.map((field) => {
          const isEmpty = !field.value || field.value.trim() === "";
          return (
            <ImageSectionCard
              key={field.key}
              icon={field.icon}
              title={field.title}
              gradient={field.gradient}
              isEmpty={isEmpty}
            >
              {field.type === "units" ? (
                <UnitCard data={field.value} />
              ) : (
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                  {field.value}
                </p>
              )}
            </ImageSectionCard>
          );
        })}
      </div>
    </div>
  );
}
