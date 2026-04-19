"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronDown, Layers, ImageIcon } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getPathBySlug, getPathImage, getDbNameFromSlug } from "@/lib/paths-config";

interface CapabilityType {
  capability_code: string;
  type: string;
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
  const slug = decodeURIComponent(params.slug as string);
  const pathConfig = getPathBySlug(slug);
  const pathImage = getPathImage(slug);
  const dbName = getDbNameFromSlug(slug);

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
            {capabilities.length} قدرة في هذا المسار
          </p>
        </div>
      </div>

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
      {capabilities.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Layers size={48} className="mx-auto text-text-muted/30 mb-4" />
          <h2 className="text-lg font-medium text-text-muted mb-2">لا توجد قدرات</h2>
          <p className="text-sm text-text-muted/70">
            لم يتم رفع بيانات لهذا المسار بعد
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, capIdx) => {
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
                    {/* Placeholder image area */}
                    <div className="relative h-[140px] bg-gradient-to-br from-bg-card to-bg-soft flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/images/capability-placeholder.svg`}
                        alt={cap.capability}
                        width={400}
                        height={140}
                        className="w-full h-full object-cover opacity-20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={40} className="text-text-muted/20" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 to-transparent" />
                      <div className="absolute bottom-3 right-4 left-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-text">{cap.capability}</h3>
                            <p className="text-xs text-text-muted mt-0.5">
                              {cap.subCapabilities.length} قدرة فرعية
                              <span className="opacity-60"> &bull; </span>
                              {cap.typesCount} {cap.typesCount === 1 ? "نوع" : "أنواع"}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-accent-soft/50 flex items-center justify-center">
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
                      <div className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full bg-accent-soft/80 text-accent-light font-medium border border-accent/20">
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
