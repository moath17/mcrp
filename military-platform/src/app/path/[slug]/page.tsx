"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronDown, Layers } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getPathBySlug, getPathImage } from "@/lib/paths-config";

interface CapabilityType {
  capability_code: string;
  type: string;
  sub_capability: string;
  definition: string;
}

interface CapabilityGroup {
  capability: string;
  types: CapabilityType[];
}

export default function PathPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const pathConfig = getPathBySlug(slug);
  const pathImage = getPathImage(slug);

  const [capabilities, setCapabilities] = useState<CapabilityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCap, setExpandedCap] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/path-capabilities?path=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCapabilities(data.capabilities);
      })
      .finally(() => setLoading(false));
  }, [slug]);

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
      <Breadcrumb
        items={[{ label: pathConfig?.name || slug }]}
      />

      {/* Path Header Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-[200px]">
        <Image
          src={pathImage}
          alt={slug}
          width={1200}
          height={200}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent" />
        <div className="absolute bottom-6 right-6">
          <h1 className="text-3xl font-black text-text">{pathConfig?.name || slug}</h1>
          <p className="text-sm text-text-muted mt-1">
            {capabilities.length} قدرة في هذا المسار
          </p>
        </div>
      </div>

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
        <div className="space-y-4">
          {capabilities.map((cap) => {
            const isExpanded = expandedCap === cap.capability;
            return (
              <div key={cap.capability} className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                {/* Capability Header */}
                <button
                  onClick={() => toggleCapability(cap.capability)}
                  className="w-full flex items-center justify-between p-5 text-right hover:bg-glass transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                      <Layers size={22} className="text-accent-light" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text">{cap.capability}</h3>
                      <p className="text-sm text-text-muted mt-0.5">
                        {cap.types.length} {cap.types.length === 1 ? "نوع" : "أنواع"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-text-muted transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Types */}
                {isExpanded && (
                  <div className="animate-expand border-t border-line">
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {cap.types.map((t, idx) => (
                        <Link
                          key={t.capability_code}
                          href={`/path/${encodeURIComponent(slug)}/type/${encodeURIComponent(t.capability_code)}`}
                          className="group relative p-4 rounded-xl bg-bg-card/60 border border-line hover:border-accent/40 hover:bg-accent-soft/30 transition-all duration-200"
                        >
                          <div className="text-xs text-accent-light font-medium mb-1">
                            نوع {idx + 1}
                          </div>
                          <div className="text-sm font-bold text-text group-hover:text-accent-light transition-colors">
                            {t.type || t.capability_code}
                          </div>
                          {t.sub_capability && (
                            <div className="text-xs text-text-muted mt-1 line-clamp-1">
                              {t.sub_capability}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
