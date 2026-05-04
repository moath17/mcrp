"use client";

import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL = "/data/countries-110m.json";

/**
 * Arabic country name → ISO 3166-1 numeric code (string, 3 digits).
 * The world-atlas TopoJSON uses numeric IDs, so we match those here.
 *
 * Multiple Arabic spellings/variants point to the same code on purpose.
 * Matching is whole-word with normalized punctuation, so we don't get
 * spurious hits like "العراق" → "ايران".
 */
const ARABIC_TO_NUMERIC: Record<string, string> = {
  // ───────── الخليج / الجزيرة العربية ─────────
  "السعودية": "682",
  "المملكة العربية السعودية": "682",
  "الإمارات": "784",
  "الامارات": "784",
  "الإمارات العربية المتحدة": "784",
  "قطر": "634",
  "الكويت": "414",
  "البحرين": "048",
  "عمان": "512",
  "سلطنة عمان": "512",
  "اليمن": "887",
  // ───────── المشرق العربي ─────────
  "العراق": "368",
  "الأردن": "400",
  "الاردن": "400",
  "سوريا": "760",
  "سورية": "760",
  "لبنان": "422",
  "فلسطين": "275",
  // ───────── شمال أفريقيا ─────────
  "مصر": "818",
  "ليبيا": "434",
  "تونس": "788",
  "الجزائر": "012",
  "المغرب": "504",
  "موريتانيا": "478",
  "السودان": "729",
  "جنوب السودان": "728",
  // ───────── القرن الأفريقي / أفريقيا الشرقية ─────────
  "الصومال": "706",
  "جيبوتي": "262",
  "إثيوبيا": "231",
  "اثيوبيا": "231",
  "إريتريا": "232",
  "اريتريا": "232",
  "كينيا": "404",
  "أوغندا": "800",
  "اوغندا": "800",
  "تنزانيا": "834",
  "رواندا": "646",
  // ───────── أفريقيا (بقية) ─────────
  "نيجيريا": "566",
  "جنوب أفريقيا": "710",
  "جنوب افريقيا": "710",
  "تشاد": "148",
  "النيجر": "562",
  "مالي": "466",
  "السنغال": "686",
  "غانا": "288",
  // ───────── الشرق الأوسط (غير عربي) ─────────
  "إيران": "364",
  "ايران": "364",
  "تركيا": "792",
  "إسرائيل": "376",
  "اسرائيل": "376",
  // ───────── أوروبا ─────────
  "بريطانيا": "826",
  "المملكة المتحدة": "826",
  "إنجلترا": "826",
  "فرنسا": "250",
  "ألمانيا": "276",
  "المانيا": "276",
  "إيطاليا": "380",
  "ايطاليا": "380",
  "إسبانيا": "724",
  "اسبانيا": "724",
  "البرتغال": "620",
  "هولندا": "528",
  "بلجيكا": "056",
  "السويد": "752",
  "النرويج": "578",
  "فنلندا": "246",
  "الدنمارك": "208",
  "بولندا": "616",
  "أوكرانيا": "804",
  "اوكرانيا": "804",
  "روسيا": "643",
  "اليونان": "300",
  "تشيكيا": "203",
  "النمسا": "040",
  "المجر": "348",
  "هنغاريا": "348",
  "رومانيا": "642",
  "بلغاريا": "100",
  "صربيا": "688",
  "كرواتيا": "191",
  "سويسرا": "756",
  "إيرلندا": "372",
  "ايرلندا": "372",
  // ───────── آسيا ─────────
  "الصين": "156",
  "اليابان": "392",
  "كوريا الجنوبية": "410",
  "كوريا الشمالية": "408",
  "كوريا": "410",
  "الهند": "356",
  "باكستان": "586",
  "بنغلاديش": "050",
  "أفغانستان": "004",
  "افغانستان": "004",
  "كازاخستان": "398",
  "أوزبكستان": "860",
  "اوزبكستان": "860",
  "تركمانستان": "795",
  "أذربيجان": "031",
  "اذربيجان": "031",
  "أرمينيا": "051",
  "ارمينيا": "051",
  "جورجيا": "268",
  "تايلاند": "764",
  "فيتنام": "704",
  "ماليزيا": "458",
  "إندونيسيا": "360",
  "اندونيسيا": "360",
  "الفلبين": "608",
  "سنغافورة": "702",
  "ميانمار": "104",
  "بورما": "104",
  // ───────── الأمريكتان ─────────
  "أمريكا": "840",
  "امريكا": "840",
  "الولايات المتحدة": "840",
  "الولايات المتحدة الأمريكية": "840",
  "كندا": "124",
  "المكسيك": "484",
  "البرازيل": "076",
  "الأرجنتين": "032",
  "الارجنتين": "032",
  "تشيلي": "152",
  "كولومبيا": "170",
  "بيرو": "604",
  "فنزويلا": "862",
  "كوبا": "192",
  // ───────── أوقيانوسيا ─────────
  "أستراليا": "036",
  "استراليا": "036",
  "نيوزيلندا": "554",
  "نيوزيلاندا": "554",
};

// Reverse lookup: numeric code → preferred Arabic display name
const NUMERIC_TO_ARABIC_DISPLAY: Record<string, string> = {};
const PREFERRED_LABELS = new Set([
  "السعودية",
  "الإمارات",
  "قطر",
  "الكويت",
  "البحرين",
  "عمان",
  "اليمن",
  "العراق",
  "الأردن",
  "سوريا",
  "لبنان",
  "فلسطين",
  "مصر",
  "ليبيا",
  "تونس",
  "الجزائر",
  "المغرب",
  "موريتانيا",
  "السودان",
  "جنوب السودان",
  "الصومال",
  "جيبوتي",
  "إثيوبيا",
  "إريتريا",
  "كينيا",
  "أوغندا",
  "تنزانيا",
  "رواندا",
  "نيجيريا",
  "جنوب أفريقيا",
  "تشاد",
  "النيجر",
  "مالي",
  "السنغال",
  "غانا",
  "إيران",
  "تركيا",
  "إسرائيل",
  "بريطانيا",
  "فرنسا",
  "ألمانيا",
  "إيطاليا",
  "إسبانيا",
  "البرتغال",
  "هولندا",
  "بلجيكا",
  "السويد",
  "النرويج",
  "فنلندا",
  "الدنمارك",
  "بولندا",
  "أوكرانيا",
  "روسيا",
  "اليونان",
  "تشيكيا",
  "النمسا",
  "المجر",
  "رومانيا",
  "بلغاريا",
  "صربيا",
  "كرواتيا",
  "سويسرا",
  "إيرلندا",
  "الصين",
  "اليابان",
  "كوريا الجنوبية",
  "كوريا الشمالية",
  "الهند",
  "باكستان",
  "بنغلاديش",
  "أفغانستان",
  "كازاخستان",
  "أوزبكستان",
  "تركمانستان",
  "أذربيجان",
  "أرمينيا",
  "جورجيا",
  "تايلاند",
  "فيتنام",
  "ماليزيا",
  "إندونيسيا",
  "الفلبين",
  "سنغافورة",
  "ميانمار",
  "أمريكا",
  "كندا",
  "المكسيك",
  "البرازيل",
  "الأرجنتين",
  "تشيلي",
  "كولومبيا",
  "بيرو",
  "فنزويلا",
  "كوبا",
  "أستراليا",
  "نيوزيلندا",
]);
for (const [name, code] of Object.entries(ARABIC_TO_NUMERIC)) {
  if (PREFERRED_LABELS.has(name) && !(code in NUMERIC_TO_ARABIC_DISPLAY)) {
    NUMERIC_TO_ARABIC_DISPLAY[code] = name;
  }
}

/**
 * Normalize an input string for matching:
 *   - Strip Arabic diacritics
 *   - Replace common punctuation with spaces
 *   - Collapse whitespace
 *   - Surround with spaces so "includes(' name ')" gives whole-word match
 */
function normalize(text: string): string {
  return (
    " " +
    text
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // tashkeel + tatweel
      .replace(/[،,;:.\-_/()\[\]{}|]/g, " ")
      .replace(/\s+/g, " ")
      .trim() +
    " "
  );
}

function parseCountries(text: string | undefined): {
  matched: { code: string; name: string }[];
} {
  if (!text || text.trim() === "") return { matched: [] };
  const haystack = normalize(text);
  const seen = new Map<string, string>(); // code → first matched name

  // Sort keys by length DESC so we match "كوريا الجنوبية" before "كوريا"
  const keys = Object.keys(ARABIC_TO_NUMERIC).sort(
    (a, b) => b.length - a.length
  );
  for (const arabicName of keys) {
    const needle = " " + normalize(arabicName).trim() + " ";
    if (haystack.includes(needle)) {
      const code = ARABIC_TO_NUMERIC[arabicName];
      if (!seen.has(code)) {
        // Prefer the canonical display label if we have one
        seen.set(code, NUMERIC_TO_ARABIC_DISPLAY[code] || arabicName);
      }
    }
  }
  return {
    matched: Array.from(seen, ([code, name]) => ({ code, name })),
  };
}

export default function CountriesMap({ value }: { value?: string }) {
  const { matched } = useMemo(() => parseCountries(value), [value]);
  const highlightedSet = useMemo(
    () => new Set(matched.map((m) => m.code)),
    [matched]
  );
  const isEmpty = !value || value.trim() === "";

  return (
    <div className="rounded-md border border-line/60 bg-bg-soft/40 overflow-hidden">
      {/* Header band — same look as FormCell */}
      <div className="px-3 py-1.5 bg-bg-soft/80 border-b border-line/50 flex items-center justify-center gap-2">
        <span className="text-[12.5px] font-bold text-text-muted tracking-wide">
          الدول والقوات المستخدمة للقدرة
        </span>
        {matched.length > 0 && (
          <span className="text-[10.5px] font-bold text-accent-light bg-accent-soft border border-accent/30 px-2 py-0.5 rounded-full">
            {matched.length} دولة
          </span>
        )}
      </div>

      {/* Map */}
      <div className="relative bg-[#0b1426] px-2 py-1">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          width={900}
          height={420}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // TopoJSON country-110m uses ISO numeric in `geo.id`
                const id = String(geo.id).padStart(3, "0");
                const isHighlighted = highlightedSet.has(id);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isHighlighted ? "#2563eb" : "#1e293b",
                        stroke: isHighlighted
                          ? "#60a5fa"
                          : "rgba(148, 163, 184, 0.35)",
                        strokeWidth: isHighlighted ? 0.7 : 0.4,
                        outline: "none",
                      },
                      hover: {
                        fill: isHighlighted ? "#3b82f6" : "#334155",
                        stroke: isHighlighted
                          ? "#93c5fd"
                          : "rgba(148, 163, 184, 0.55)",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: "default",
                      },
                      pressed: {
                        fill: isHighlighted ? "#2563eb" : "#1e293b",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Footer: matched countries chips OR original text fallback */}
      {matched.length > 0 ? (
        <div className="px-3 py-2.5 border-t border-line/50 bg-bg-soft/30">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-text-muted ml-2 shrink-0">
              الدول المحددة:
            </span>
            {matched.map((m) => (
              <span
                key={m.code}
                className="inline-flex items-center gap-1 text-[12px] text-accent-light bg-accent-soft border border-accent/30 px-2 py-0.5 rounded-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                {m.name}
              </span>
            ))}
          </div>
        </div>
      ) : !isEmpty ? (
        <div className="px-3 py-2 border-t border-line/50 bg-bg-soft/30">
          <p className="text-[11.5px] text-text-muted leading-relaxed whitespace-pre-wrap">
            {value}
          </p>
          <p className="text-[10.5px] text-text-muted/50 italic mt-1">
            لم يتم التعرف على أسماء دول معروفة في النص
          </p>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-line/50 bg-bg-soft/30 text-center">
          <span className="text-[11.5px] text-text-muted/50 italic">
            لا توجد بيانات
          </span>
        </div>
      )}
    </div>
  );
}
