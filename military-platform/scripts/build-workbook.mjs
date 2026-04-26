/**
 * Master workbook builder.
 *
 * Reads "نماذج جمع المعلومات.xlsx" and produces the final state the app expects:
 *   1. Ensures the "4D" column on the "Key" sheet is present and balanced:
 *        - "Deployment Support" for مسار 9 and مسار 10
 *        - Detect / Deter / Defend evenly distributed across paths 1..8
 *   2. Halves the number of types (targets ~2,149 rows) by keeping every other row per path.
 *      Idempotent: if the sheet already has <= 2,600 rows it skips the halving step.
 *   3. Filters "نموذج عام - متطلب خاص" and "نموذج عام - متطلب عام" so they only reference
 *      capability codes that still exist in the Key sheet.
 *   4. Creates / replaces the sheet "نموذج عام - متطلب عام - Hanwha + Norinco":
 *      same 19 columns, exactly 2 rows per surviving type (Hanwha + Norinco) with
 *      deterministic dummy data tuned to each path and company.
 *
 * Output: writes back to the workspace-root xlsx AND mirrors it to
 * military-platform/data/default.xlsx for the app to reseed from.
 */
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(platformRoot, "..");

const SOURCE_XLSX = path.join(workspaceRoot, "نماذج جمع المعلومات.xlsx");
const DEFAULT_XLSX = path.join(platformRoot, "data", "default.xlsx");

const KEY_SHEET = "Key";
const SPECIAL_SHEET_PATTERN = "متطلب خاص";
const GENERAL_SHEET_PATTERN = "متطلب عام";
// Excel limits sheet names to 31 chars.
const COMPANIES_SHEET = "Hanwha + Norinco";

const COL_CODE = "رمز القدرة";
const COL_PATH = "المسار";
const COL_CAP = "القدرة";
const COL_SUB = "القدرة الفرعية";
const COL_TYPE = "النوع";
const COL_4D = "4D";

const DEPLOYMENT_PATHS = new Set(["مسار 9", "مسار 10"]);
const THREE_LABELS = ["Detect", "Deter", "Defend"];

const TARGET_TYPE_COUNT = 2149;
const ALREADY_HALVED_THRESHOLD = 2600;

// ------------------------------------------------------------------
// Deterministic RNG helpers
// ------------------------------------------------------------------
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pickOne(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}
function evenlyDistribute(count, labels, rng) {
  const assignment = new Array(count);
  const indices = Array.from({ length: count }, (_, i) => i);
  shuffleInPlace(indices, rng);
  for (let k = 0; k < count; k++) {
    assignment[indices[k]] = labels[k % labels.length];
  }
  return assignment;
}

// ------------------------------------------------------------------
// Sheet helpers
// ------------------------------------------------------------------
function findSheet(wb, pattern) {
  return wb.SheetNames.find((n) => n.includes(pattern));
}
function sheetToRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

// ------------------------------------------------------------------
// Step 1: ensure 4D column
// ------------------------------------------------------------------
function applyFourD(rows) {
  const byPath = new Map();
  rows.forEach((row, idx) => {
    const p = String(row[COL_PATH] || "").trim();
    if (!byPath.has(p)) byPath.set(p, []);
    byPath.get(p).push(idx);
  });

  for (const [pathName, idxList] of byPath) {
    if (DEPLOYMENT_PATHS.has(pathName)) {
      for (const i of idxList) rows[i][COL_4D] = "Deployment Support";
      continue;
    }
    const rng = mulberry32(hash32(`4D::${pathName}`));
    const labels = evenlyDistribute(idxList.length, THREE_LABELS, rng);
    idxList.forEach((i, k) => {
      rows[i][COL_4D] = labels[k];
    });
  }
}

// ------------------------------------------------------------------
// Step 2: halve rows per path (idempotent)
// ------------------------------------------------------------------
function halveRows(rows) {
  if (rows.length <= ALREADY_HALVED_THRESHOLD) {
    return { rows, halved: false };
  }
  const byPath = new Map();
  rows.forEach((row, idx) => {
    const p = String(row[COL_PATH] || "").trim();
    if (!byPath.has(p)) byPath.set(p, []);
    byPath.get(p).push({ row, idx });
  });
  const kept = [];
  for (const [, list] of byPath) {
    // Keep even indices within this path (0, 2, 4, ...). Preserves hierarchy coverage
    // since ordering is path > capability > sub_capability > type.
    for (let i = 0; i < list.length; i += 2) kept.push(list[i]);
  }
  // Preserve original document order
  kept.sort((a, b) => a.idx - b.idx);
  return { rows: kept.map((k) => k.row), halved: true };
}

// ------------------------------------------------------------------
// Step 4: generate Hanwha + Norinco company profiles sheet
// ------------------------------------------------------------------
const HANWHA_INFO = {
  short: "Hanwha",
  name: "Hanwha Aerospace / Hanwha Defense",
  country: "كوريا الجنوبية",
  intro:
    "مجموعة هانوا الكورية (Hanwha Group) هي إحدى أكبر شركات الصناعات الدفاعية في كوريا الجنوبية، تأسست عام 1952 ولها خبرة عميقة في أنظمة المدفعية والعربات القتالية والدفاع الجوي ومنظومات الطاقة والفضاء. تمتلك الشركة سجلاً ممتداً من التعاون مع قوى دفاعية متعددة حول العالم وتقدّم حلولاً متكاملة تشمل التصنيع والتدريب والدعم اللوجستي طويل المدى.",
};

const NORINCO_INFO = {
  short: "Norinco",
  name: "China North Industries Corporation (NORINCO)",
  country: "الصين",
  intro:
    "مؤسسة نورينكو (NORINCO) هي المجموعة الصناعية الدفاعية الصينية التي تأسست عام 1980، وتُعد من أكبر المنتجين العالميين للأنظمة البرية المدرعة والمدفعية والأسلحة الخفيفة وأنظمة الدفاع الجوي منخفضة ومتوسطة الارتفاع. توفّر الشركة حلولاً متكاملة للتصنيع والتجميع المحلي ودعم ما بعد البيع، مع مرونة عالية في تكييف المنظومات حسب متطلبات المستخدم.",
};

// Representative product naming per path per company (used as اسم القدرة).
const PATH_PRODUCT_NAMES = {
  "مسار 1": {
    Hanwha: ["K808 Tigon", "K21 IFV", "K200A1", "K806 6x6", "AS21 Redback"],
    Norinco: ["VT-4 MBT", "VN-1 8x8", "ZBL-09", "VN-22 6x6", "WZ-551"],
  },
  "مسار 2": {
    Hanwha: ["K9A2 Thunder", "K10 ARV", "KH179", "K105A1 EVO", "K9 Self-Propelled"],
    Norinco: ["PLZ-05 155mm", "PLZ-07 122mm", "SH-15 155mm", "SH-4 122mm", "PLL-09"],
  },
  "مسار 3": {
    Hanwha: ["Cheongung-II (KM-SAM)", "K30 Biho", "K-SAAM", "Cheolmae", "L-SAM"],
    Norinco: ["HQ-9BE", "LY-80E", "FK-3", "LY-60D", "HQ-17AE"],
  },
  "مسار 4": {
    Hanwha: ["K4 40mm AGL", "K6 12.7mm HMG", "K11 60mm Mortar", "KM187 81mm"],
    Norinco: ["W87 35mm AGL", "QJG-02 12.7mm", "PP-89 82mm Mortar", "W99 120mm"],
  },
  "مسار 5": {
    Hanwha: ["TMMR SDR", "CHTS Tactical Radio", "Hanwha C4I Suite", "TICN Network"],
    Norinco: ["CHDR-201 SDR", "Type-889", "CNC-CCS C4I", "CW-20 Radio"],
  },
  "مسار 6": {
    Hanwha: ["TRS-3D Radar", "K-SAR Surveillance", "TAS-1K", "Hanwha EO/IR"],
    Norinco: ["JY-26 Radar", "YLC-8B", "SLC-7", "CETC EO/IR"],
  },
  "مسار 7": {
    Hanwha: ["Chunmoo KMAR", "MUAV Night Intruder", "RQ-101 UAV", "Hanwha VTOL"],
    Norinco: ["CH-4 UCAV", "CH-5 UCAV", "ASN-209", "Sky Saker H300"],
  },
  "مسار 8": {
    Hanwha: ["K2C1 Rifle", "K5 Pistol", "K14 Sniper", "K11 DRW"],
    Norinco: ["QBZ-191 Rifle", "QSZ-92 Pistol", "QBU-88 DMR", "CS/LR4 Sniper"],
  },
  "مسار 9": {
    Hanwha: ["K600 Rhino (CEV)", "K61 Bridge Layer", "K919 Mine Plow", "K711 Support"],
    Norinco: ["GCZ-110 Engineer", "GSL-132 Minelayer", "HJL-201 Breacher", "GJL-112"],
  },
  "مسار 10": {
    Hanwha: ["K721 Medical APC", "K737 Ambulance", "K77 Medevac Support"],
    Norinco: ["ZBL-08 Medical", "WZ-551 Ambulance", "Type-88 Medical Support"],
  },
};

const COUNTRIES_HANWHA = [
  "كوريا الجنوبية، أستراليا، بولندا، النرويج، مصر، الإمارات، السعودية، الهند",
  "كوريا الجنوبية، تركيا، فنلندا، رومانيا، إستونيا، الهند، السعودية",
  "كوريا الجنوبية، السعودية، الإمارات، ماليزيا، إندونيسيا، الفلبين",
];
const COUNTRIES_NORINCO = [
  "الصين، باكستان، تايلاند، بنغلاديش، نيجيريا، الجزائر، السعودية",
  "الصين، إيران، فنزويلا، تنزانيا، السودان، ميانمار، كمبوديا",
  "الصين، باكستان، تايلاند، أوزبكستان، بوليفيا، السعودية",
];

const LOCALIZATION_STATES = [
  "موطن",
  "غير موطن",
  "توجد اتفاقية لتوطينها",
  "قيد الدراسة",
];

const CONFLICT_HISTORY_HANWHA = [
  "شاركت القدرة في تمارين دولية متعددة الأطراف (Talisman Sabre، Foal Eagle، درع الجزيرة)",
  "استُخدمت في تعزيز الحدود الكورية منزوعة السلاح وتمارين بحر اليابان",
  "دعمت قوات التحالف في اليمن ضمن منظومات التحالف الإقليمي",
];
const CONFLICT_HISTORY_NORINCO = [
  "شاركت القدرة في عمليات مكافحة الإرهاب في باكستان والجزائر",
  "استُخدمت في نزاعات إقليمية في أفريقيا والشرق الأوسط منذ 2005",
  "اختُبرت ميدانياً في تمارين منظمة شنغهاي وتمارين القوات المشتركة",
];

function costForPath(pathName, rng, company) {
  const buckets = {
    "مسار 1": [3_500_000, 14_000_000],
    "مسار 2": [8_000_000, 28_000_000],
    "مسار 3": [22_000_000, 90_000_000],
    "مسار 4": [120_000, 650_000],
    "مسار 5": [85_000, 540_000],
    "مسار 6": [2_500_000, 18_000_000],
    "مسار 7": [6_000_000, 52_000_000],
    "مسار 8": [5_500, 42_000],
    "مسار 9": [2_800_000, 16_000_000],
    "مسار 10": [1_100_000, 9_500_000],
  };
  const [lo, hi] = buckets[pathName] || [50_000, 500_000];
  // Norinco is often positioned more aggressively on price.
  const factor = company === "Norinco" ? 0.78 : 1;
  const raw = Math.round((lo + rng() * (hi - lo)) * factor);
  return `${raw.toLocaleString("en-US")} ريال سعودي`;
}

function techSpecs(pathName, rng, company) {
  // Light variation per path so the page looks alive. These are dummy specs.
  const mkRange = (base, spread) =>
    Math.round(base + (rng() - 0.5) * spread);
  switch (pathName) {
    case "مسار 1":
      return `الوزن: ${mkRange(25, 8)} طن | السرعة القصوى: ${mkRange(100, 30)} كم/س | المدى: ${mkRange(700, 300)} كم | الطاقم: ${mkRange(3, 2)}+${mkRange(8, 4)} جنود | الحماية: STANAG 4569 المستوى ${mkRange(4, 2)}`;
    case "مسار 2":
      return `العيار: ${pickOne(["155 ملم", "122 ملم", "105 ملم"], rng)} | المدى الأقصى: ${mkRange(42, 18)} كم | معدل النيران: ${mkRange(8, 4)} طلقات/دقيقة | حمولة الذخيرة: ${mkRange(48, 20)} طلقة | زاوية الرفع: -5° إلى +72°`;
    case "مسار 3":
      return `المدى: ${mkRange(40, 30)} كم | الارتفاع: ${mkRange(20, 15)} كم | عدد الصواريخ: ${mkRange(8, 4)} | وقت الاستجابة: ${mkRange(8, 4)} ث | رادار: AESA متعدد الوظائف`;
    case "مسار 4":
      return `العيار: ${pickOne(["40 ملم", "12.7 ملم", "60 ملم", "81 ملم", "120 ملم"], rng)} | المدى الفعّال: ${mkRange(2200, 1800)} م | معدل النيران: ${mkRange(350, 200)} طلقة/د | الوزن: ${mkRange(38, 22)} كغ`;
    case "مسار 5":
      return `النطاق الترددي: ${mkRange(30, 20)} - ${mkRange(512, 200)} ميجاهرتز | معدل البيانات: ${mkRange(256, 128)} كيلوبت/ث | التشفير: AES-256 | المدى: ${mkRange(30, 20)} كم | IP67`;
    case "مسار 6":
      return `نطاق الرؤية: ${mkRange(12, 8)} كم حراري / ${mkRange(18, 10)} كم EO | الرادار: ${pickOne(["AESA", "PESA", "Doppler Pulse"], rng)} | مدى الرصد: ${mkRange(85, 60)} كم | GPS/INS`;
    case "مسار 7":
      return `المدى: ${mkRange(1200, 900)} كم | مدة التحليق: ${mkRange(20, 14)} ساعة | السقف: ${mkRange(7500, 3500)} م | السرعة: ${mkRange(220, 80)} كم/س | الحمولة: ${mkRange(450, 300)} كغ`;
    case "مسار 8":
      return `العيار: ${pickOne(["5.56×45 ملم", "7.62×39 ملم", "9×19 ملم", "7.62×51 ملم"], rng)} | المدى الفعّال: ${mkRange(500, 400)} م | معدل النيران: ${mkRange(700, 300)} طلقة/د | وزن السلاح: ${mkRange(3.4, 1.6)} كغ`;
    case "مسار 9":
      return `قدرة الجر: ${mkRange(35, 20)} طن | عمق الحفر: ${mkRange(3.5, 2)} م | المعدّات: كاسحة ألغام + ذراع هندسي + جسر قابل للطي | الطاقم: ${mkRange(3, 2)}`;
    case "مسار 10":
      return `سعة المرضى: ${mkRange(6, 4)} أسرّة + ${mkRange(2, 2)} نقالة | أجهزة: ECG + Defib + Ventilator + Oxygen | تكييف طبي | تشغيل مستقل: ${mkRange(48, 24)} ساعة`;
    default:
      return "مواصفات فنية مفصّلة متاحة عند الطلب.";
  }
}

function buildCompanyProfile(info, keyRow, rng) {
  const pathName = keyRow[COL_PATH] || "";
  const pool = PATH_PRODUCT_NAMES[pathName] || {
    Hanwha: ["Hanwha Capability"],
    Norinco: ["NORINCO Capability"],
  };
  const product = pickOne(pool[info.short] || pool.Hanwha, rng);

  const scope = `منظومة ${product} تعمل ضمن فئة "${keyRow[COL_CAP] || ""}" وتحديداً "${keyRow[COL_SUB] || ""}" بنسختها "${keyRow[COL_TYPE] || ""}"، وتمثّل خياراً متكاملاً لتغطية المتطلبات التشغيلية في هذا المسار.`;

  const developmentYears = 2000 + Math.floor(rng() * 22);
  const currentGen = 1 + Math.floor(rng() * 5);

  return {
    [COL_CODE]: keyRow[COL_CODE],
    [COL_TYPE]: keyRow[COL_TYPE] || "",
    "اسم القدرة": product,
    "اسم الشركة": info.short,
    "تعريف بالشركة": info.intro,
    "نطاق التعريف للقدرة": scope,
    "تاريخ التطوير الخاص بالقدرة": `الإصدار الأول: ${developmentYears}. الجيل الحالي (${currentGen}) بدأ الإنتاج عام ${developmentYears + currentGen * 3}. تحديثات متعددة في الإلكترونيات، نظام الحماية، والمحرك.`,
    "التسليح والذخائر/الصواريخ":
      pathName === "مسار 3"
        ? "صواريخ اعتراض متوسطة/طويلة المدى + صواريخ قصيرة المدى للدفاع الذاتي + قاذف قنابل خداعية."
        : pathName === "مسار 7"
        ? "صواريخ موجّهة هواء-أرض + ذخائر ذكية منخفضة الوزن + نظام استهداف بالليزر."
        : pathName === "مسار 10"
        ? "لا يوجد تسليح. تجهيز طبي ميداني متكامل مع أنظمة إنقاذ."
        : pathName === "مسار 9"
        ? "مدفع رشاش 12.7 ملم للدفاع الذاتي + قاذف قنابل دخانية + أدوات هندسية متخصصة."
        : "تسليح رئيسي متعدد الأعيرة + رشاش مساعد 7.62 ملم + قاذف قنابل دخانية 6×76 ملم.",
    "تكلفة القدرة": costForPath(pathName, rng, info.short),
    "عائلة القدرة والانواع المتاحة": `عائلة ${product.split(" ")[0]} تضم: نسخة قتالية، نسخة قيادة وسيطرة، نسخة إسناد، نسخة تدريب. الأنواع المتاحة حالياً: ${1 + Math.floor(rng() * 4)}.`,
    "المواصفات الفنية": techSpecs(pathName, rng, info.short),
    "الدول والقوات المستخدمة للقدرة":
      info.short === "Hanwha"
        ? pickOne(COUNTRIES_HANWHA, rng)
        : pickOne(COUNTRIES_NORINCO, rng),
    "متطلبات التدريب": `دورة تأهيل أساسية ${4 + Math.floor(rng() * 6)} أسابيع لطاقم التشغيل، تدريب ميداني ${2 + Math.floor(rng() * 4)} أشهر، توفير محاكي تدريبي ودليل تشغيل متكامل باللغتين العربية والإنجليزية.`,
    "حالة التوطين للقدرة": pickOne(LOCALIZATION_STATES, rng),
    "تشكيل المنظومة (ان وجدت)": `المشغّلون: ${pickOne(["سائق + قائد + رامي", "قائد + مشغّل رادار + مشغّل أسلحة", "قائد + ملاحظ أمامي + طاقم تحميل"], rng)}. تعمل ضمن ${pickOne(["سرية", "فصيلة", "كتيبة"], rng)} من ${4 + Math.floor(rng() * 12)} وحدة.`,
    "الاختبارات المصنعية للقدرة": `اختبارات شاملة وفق MIL-STD-810: البيئة (-32°م إلى +55°م)، الاهتزاز، الصدمات، الغبار والرطوبة، التوافق الكهرومغناطيسي EMC، واختبار الأداء العملياتي ${200 + Math.floor(rng() * 800)} ساعة.`,
    "متطلبات التخزين والاستدامة": `تخزين في مستودعات مكيفة (15-25°م) برطوبة لا تتجاوز 60%. صيانة دورية كل ${3 + Math.floor(rng() * 9)} أشهر. عمر التخزين الافتراضي ${10 + Math.floor(rng() * 15)} سنة.`,
    "الأنظمة الفرعية المرتبطة بالقدرة": `نظام رؤية بانورامية، نظام تحديد مواقع GPS/INS، راديو SDR متكامل، نظام إنذار ليزري، ${pickOne(["نظام BMS", "نظام إطلاق ذخائر نشطة", "نظام إخفاء حراري"], rng)}.`,
    "مشاركة القدرة في النزاعات":
      info.short === "Hanwha"
        ? pickOne(CONFLICT_HISTORY_HANWHA, rng)
        : pickOne(CONFLICT_HISTORY_NORINCO, rng),
  };
}

function buildCompanyProfilesSheet(keyRows) {
  const instructionRow = {
    [COL_CODE]: "بحسب ما يتم العمل به ضمن القدرات المستقبلية",
    [COL_TYPE]: "بحسب ما يتم العمل به ضمن القدرات المستقبلية",
    "اسم القدرة": "تعبئة تلقائية — شركتان لكل نوع (Hanwha + Norinco)",
    "اسم الشركة": "Hanwha أو Norinco",
    "تعريف بالشركة": "يُعبأ تلقائياً لكل شركة",
    "نطاق التعريف للقدرة": "يُعبأ تلقائياً لكل نوع",
    "تاريخ التطوير الخاص بالقدرة": "",
    "التسليح والذخائر/الصواريخ": "",
    "تكلفة القدرة": "",
    "عائلة القدرة والانواع المتاحة": "",
    "المواصفات الفنية": "",
    "الدول والقوات المستخدمة للقدرة": "",
    "متطلبات التدريب": "",
    "حالة التوطين للقدرة": "",
    "تشكيل المنظومة (ان وجدت)": "",
    "الاختبارات المصنعية للقدرة": "",
    "متطلبات التخزين والاستدامة": "",
    "الأنظمة الفرعية المرتبطة بالقدرة": "",
    "مشاركة القدرة في النزاعات": "",
  };

  const rows = [instructionRow];
  for (const keyRow of keyRows) {
    const code = keyRow[COL_CODE];
    const rngHanwha = mulberry32(hash32(`Hanwha::${code}`));
    const rngNorinco = mulberry32(hash32(`Norinco::${code}`));
    rows.push(buildCompanyProfile(HANWHA_INFO, keyRow, rngHanwha));
    rows.push(buildCompanyProfile(NORINCO_INFO, keyRow, rngNorinco));
  }
  return rows;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
function main() {
  if (!fs.existsSync(SOURCE_XLSX)) {
    throw new Error(`Source workbook not found: ${SOURCE_XLSX}`);
  }

  const wb = XLSX.read(fs.readFileSync(SOURCE_XLSX), { type: "buffer" });

  const keySheetName = wb.SheetNames.find((n) => n === KEY_SHEET) || KEY_SHEET;
  const specialSheetName = findSheet(wb, SPECIAL_SHEET_PATTERN);
  const generalSheetName = wb.SheetNames.find(
    (n) => n.includes(GENERAL_SHEET_PATTERN) && !n.includes("Hanwha")
  );

  if (!wb.Sheets[keySheetName]) {
    throw new Error(`Missing sheet "${keySheetName}"`);
  }

  let keyRows = sheetToRows(wb.Sheets[keySheetName]);

  // Step 1: halve if needed
  const { rows: halvedRows, halved } = halveRows(keyRows);
  keyRows = halvedRows;

  // Step 2: rebalance 4D on whatever the current set is
  applyFourD(keyRows);

  // Step 3: rebuild Key sheet
  const keyHeader = [COL_CODE, COL_PATH, COL_CAP, COL_SUB, COL_TYPE, COL_4D];
  wb.Sheets[keySheetName] = XLSX.utils.json_to_sheet(keyRows, {
    header: keyHeader,
  });

  // Build the set of valid codes
  const validCodes = new Set(keyRows.map((r) => r[COL_CODE]));

  // Step 4: filter special + general sheets to keep only valid codes.
  // The example/instruction row (first row) is always preserved.
  const filterSupportSheet = (sheetName) => {
    if (!sheetName || !wb.Sheets[sheetName]) return 0;
    const rows = sheetToRows(wb.Sheets[sheetName]);
    if (rows.length === 0) return 0;
    const header = Object.keys(rows[0]);
    const kept = [rows[0]]; // instruction/example row
    for (let i = 1; i < rows.length; i++) {
      const code = String(rows[i][COL_CODE] || "").trim();
      if (validCodes.has(code)) kept.push(rows[i]);
    }
    wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(kept, { header });
    return kept.length - 1;
  };
  const specialKept = filterSupportSheet(specialSheetName);
  const generalKept = filterSupportSheet(generalSheetName);

  // Step 5: build Hanwha + Norinco sheet (always regenerated)
  const companyRows = buildCompanyProfilesSheet(keyRows);
  const companyHeader = [
    COL_CODE,
    COL_TYPE,
    "اسم القدرة",
    "اسم الشركة",
    "تعريف بالشركة",
    "نطاق التعريف للقدرة",
    "تاريخ التطوير الخاص بالقدرة",
    "التسليح والذخائر/الصواريخ",
    "تكلفة القدرة",
    "عائلة القدرة والانواع المتاحة",
    "المواصفات الفنية",
    "الدول والقوات المستخدمة للقدرة",
    "متطلبات التدريب",
    "حالة التوطين للقدرة",
    "تشكيل المنظومة (ان وجدت)",
    "الاختبارات المصنعية للقدرة",
    "متطلبات التخزين والاستدامة",
    "الأنظمة الفرعية المرتبطة بالقدرة",
    "مشاركة القدرة في النزاعات",
  ];
  if (wb.SheetNames.includes(COMPANIES_SHEET)) {
    delete wb.Sheets[COMPANIES_SHEET];
    wb.SheetNames = wb.SheetNames.filter((n) => n !== COMPANIES_SHEET);
  }
  const companySheet = XLSX.utils.json_to_sheet(companyRows, {
    header: companyHeader,
  });
  XLSX.utils.book_append_sheet(wb, companySheet, COMPANIES_SHEET);

  fs.mkdirSync(path.dirname(DEFAULT_XLSX), { recursive: true });
  XLSX.writeFile(wb, DEFAULT_XLSX);

  let sourceSaved = true;
  try {
    XLSX.writeFile(wb, SOURCE_XLSX);
  } catch (err) {
    sourceSaved = false;
    console.warn(
      `\n⚠ Could not write back to "${SOURCE_XLSX}" (probably open in Excel). ` +
        `default.xlsx was updated. Close the file and rerun to sync the source.`
    );
  }

  // Summaries
  const byPath = {};
  const by4D = {};
  for (const r of keyRows) {
    byPath[r[COL_PATH]] = (byPath[r[COL_PATH]] || 0) + 1;
    by4D[r[COL_4D]] = (by4D[r[COL_4D]] || 0) + 1;
  }

  console.log("── Workbook build complete ───────────────────────────");
  console.log("Key sheet:");
  console.log(`  halved now: ${halved}`);
  console.log(`  total types: ${keyRows.length}`);
  console.log("  per path:");
  for (const [p, c] of Object.entries(byPath)) {
    console.log(`    ${p}: ${c}`);
  }
  console.log("  4D:", by4D);
  console.log("Filtered support sheets:");
  console.log(`  "${specialSheetName}": ${specialKept} kept (excl. example row)`);
  console.log(`  "${generalSheetName}": ${generalKept} kept (excl. example row)`);
  console.log(
    `Hanwha+Norinco sheet: ${companyRows.length - 1} company rows (${keyRows.length} types × 2)`
  );
  console.log("Saved:");
  console.log("  -", DEFAULT_XLSX);
  if (sourceSaved) console.log("  -", SOURCE_XLSX);
}

main();
