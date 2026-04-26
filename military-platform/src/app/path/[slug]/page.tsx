"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronDown, Layers, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  getPathBySlug,
  getPathImage,
  getDbNameFromSlug,
  FOUR_D_KEYS,
  FOUR_D_LABELS_AR,
  type FourDKey,
} from "@/lib/paths-config";

interface CapabilityType {
  capability_code: string;
  type: string;
  four_d?: string;
  definition: string;
}

interface SubCapability {
  sub_capability: string;
  types: CapabilityType[];
}

interface CapabilityGroup {
  capability: string;
  subCapabilities: SubCapability[];
  typesCount: number;
}

export default function PathPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = decodeURIComponent(params.slug as string);
  const pathConfig = getPathBySlug(slug);
  const pathImage = getPathImage(slug);
  const dbName = getDbNameFromSlug(slug);

  const rawFourD = searchParams.get("4d");
  const activeFourD: FourDKey | null = useMemo(() => {
    if (!rawFourD) return null;
    return (FOUR_D_KEYS as string[]).includes(rawFourD)
      ? (rawFourD as FourDKey)
      : null;
  }, [rawFourD]);

  const [capabilities, setCapabilities] = useState<CapabilityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCap, setExpandedCap] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/path-capabilities?path=${encodeURIComponent(dbName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCapabilities(data.capabilities);
      })
      .finally(() => setLoading(false));
  }, [dbName]);

  // Filter types by 4D when query param is present. Hide sub-capabilities
  // and capabilities that become empty after filtering.
  const visibleCapabilities = useMemo<CapabilityGroup[]>(() => {
    if (!activeFourD) return capabilities;
    return capabilities
      .map((cap) => {
        const subCapabilities = cap.subCapabilities
          .map((sub) => ({
            ...sub,
            types: sub.types.filter((t) => t.four_d === activeFourD),
          }))
          .filter((sub) => sub.types.length > 0);
        const typesCount = subCapabilities.reduce(
          (sum, s) => sum + s.types.length,
          0
        );
        return { ...cap, subCapabilities, typesCount };
      })
      .filter((cap) => cap.subCapabilities.length > 0);
  }, [capabilities, activeFourD]);

  const toggleCapability = (capName: string) => {
    setExpandedCap((prev) => (prev === capName ? null : capName));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin-slow text-accent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: pathConfig?.name || slug }]} />

      {/* Path Header Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-4 h-[200px]">
        <Image
          src={pathImage}
          alt={pathConfig?.name || slug}
          width={1200}
          height={200}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/60 to-transparent" />
        <div className="absolute bottom-6 right-6">
          <h1 className="text-3xl font-black text-text">{pathConfig?.name || slug}</h1>
          <p className="text-sm text-text-muted mt-1">
            {visibleCapabilities.length} قدرة
            {activeFourD ? " ضمن الفلتر الحالي" : " في هذا المسار"}
          </p>
        </div>
      </div>

      {activeFourD && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-soft/30 px-4 py-2.5 mb-4">
          <div className="text-[13px] text-text">
            الفلتر الحالي:{" "}
            <span className="font-bold text-accent-light">
              {FOUR_D_LABELS_AR[activeFourD]} ({activeFourD})
            </span>{" "}
            — يتم عرض الأنواع المصنفة بهذا التصنيف فقط
          </div>
          <Link
            href={`/path/${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-1 text-xs text-accent-light hover:text-text transition-colors"
          >
            <X size={14} /> إزالة الفلتر
          </Link>
        </div>
      )}

      {/* Path Definition */}
      {pathConfig?.description && (
        <div className="glass-panel rounded-2xl p-5 mb-8 border-r-4 border-accent">
          <div className="text-xs font-medium text-accent-light mb-1.5">
            تعريف المسار
          </div>
          <p className="text-sm text-text leading-relaxed">
            {pathConfig.description}
          </p>
        </div>
      )}

      {/* Capabilities */}
      {visibleCapabilities.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Layers size={48} className="mx-auto text-text-muted/30 mb-4" />
          <h2 className="text-lg font-medium text-text-muted mb-2">
            {activeFourD ? "لا توجد قدرات ضمن هذا التصنيف" : "لا توجد قدرات"}
          </h2>
          <p className="text-sm text-text-muted/70">
            {activeFourD
              ? "جرّب إزالة الفلتر أو اختيار تصنيف مختلف"
              : "لم يتم رفع بيانات لهذا المسار بعد"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCapabilities.map((cap, capIdx) => {
            const isExpanded = expandedCap === cap.capability;
            return (
              <div
                key={cap.capability}
                className={`${isExpanded ? "sm:col-span-2 lg:col-span-3" : ""}`}
              >
                <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Capability Card */}
                  <button
                    onClick={() => toggleCapability(cap.capability)}
                    className="w-full text-right cursor-pointer group"
                  >
                    {/* Image area */}
                    <div className="relative h-[160px] bg-gradient-to-br from-bg-card to-bg-soft overflow-hidden">
                      {pathConfig?.capabilityImage ? (
                        <Image
                          src={pathConfig.capabilityImage}
                          alt={cap.capability}
                          width={600}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers size={40} className="text-text-muted/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/40 to-transparent" />
                      <div className="absolute bottom-3 right-4 left-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-text drop-shadow-md">{cap.capability}</h3>
                            <p className="text-xs text-text-muted mt-0.5">
                              {cap.subCapabilities.length} قدرة فرعية
                              <span className="opacity-60"> &bull; </span>
                              {cap.typesCount} {cap.typesCount === 1 ? "نوع" : "أنواع"}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-accent-soft/80 backdrop-blur-sm flex items-center justify-center">
                            <ChevronDown
                              size={16}
                              className={`text-accent-light transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Capability number badge */}
                      <div className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-accent-soft/90 backdrop-blur-sm text-accent-light font-medium border border-accent/30">
                        قدرة {capIdx + 1}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Sub-capabilities → Types hierarchy */}
                  {isExpanded && (
                    <div className="animate-expand border-t border-line">
                      <div className="p-5 space-y-5">
                        {cap.subCapabilities.map((sub, subIdx) => (
                          <div key={`${sub.sub_capability}-${subIdx}`} className="space-y-2.5">
                            <div className="flex items-center gap-2 pb-2 border-b border-line/60">
                              <h4 className="text-sm font-bold text-accent2">
                                {sub.sub_capability}
                              </h4>
                              <span className="text-[11px] text-text-muted/70 mr-auto">
                                {sub.types.length} {sub.types.length === 1 ? "نوع" : "أنواع"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {sub.types.map((t, idx) => (
                                <Link
                                  key={t.capability_code}
                                  href={`/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(t.capability_code)}`}
                                  className="group relative p-4 rounded-xl bg-bg-card/60 border border-line hover:border-accent/40 hover:bg-accent-soft/30 transition-all duration-200"
                                >
                                  <div className="text-sm font-bold text-text group-hover:text-accent-light transition-colors">
                                    {t.type || `نوع ${idx + 1}`}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
