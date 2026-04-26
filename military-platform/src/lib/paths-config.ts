export interface PathConfig {
  name: string;
  dbName: string;
  image: string;
  subtitle: string;
  description: string;
  capabilityCount: number;
  capabilityImage?: string;
}

export type FourDKey = "Detect" | "Deter" | "Defend" | "Deployment Support";

export const FOUR_D_KEYS: FourDKey[] = [
  "Detect",
  "Deter",
  "Defend",
  "Deployment Support",
];

export const FOUR_D_LABELS_AR: Record<FourDKey, string> = {
  Detect: "الكشف",
  Deter: "الردع",
  Defend: "الدفاع",
  "Deployment Support": "إسناد الانتشار",
};

export const FOUR_D_DESCRIPTIONS: Record<FourDKey, string> = {
  Detect:
    "كشف التهديدات ورصد الأهداف والاستخبارات الميدانية — عبر جميع المسارات الثمانية.",
  Deter:
    "ردع الخصوم عبر الحضور والقدرات العملياتية الموزعة على المسارات الثمانية.",
  Defend:
    "حماية القوات والمنشآت ومواجهة التهديدات — عبر المسارات الثمانية.",
  "Deployment Support":
    "قدرات إسناد الانتشار ودعمه: الإسناد الهندسي والقدرات الطبية (مسار 9 و 10).",
};

// Paths included for each 4D key. Deployment Support maps ONLY to paths 9, 10.
// The other 3 keys each map to paths 1..8 (types inside them are filtered client-side).
export const FOUR_D_PATHS: Record<FourDKey, string[]> = {
  Detect: [
    "مسار 1",
    "مسار 2",
    "مسار 3",
    "مسار 4",
    "مسار 5",
    "مسار 6",
    "مسار 7",
    "مسار 8",
  ],
  Deter: [
    "مسار 1",
    "مسار 2",
    "مسار 3",
    "مسار 4",
    "مسار 5",
    "مسار 6",
    "مسار 7",
    "مسار 8",
  ],
  Defend: [
    "مسار 1",
    "مسار 2",
    "مسار 3",
    "مسار 4",
    "مسار 5",
    "مسار 6",
    "مسار 7",
    "مسار 8",
  ],
  "Deployment Support": ["مسار 9", "مسار 10"],
};

export const MILITARY_PATHS: PathConfig[] = [
  {
    name: "العربات",
    dbName: "مسار 1",
    image: "/images/path1.jpeg",
    subtitle: "قتالية • خدمة • اطفاء • اسعاف",
    description:
      "كل وسيلة نقل أو قتال تتحرك على الأرض وتُستخدم في العمليات العسكرية.",
    capabilityCount: 9,
    capabilityImage: "/images/path1.jpeg",
  },
  {
    name: "المدفعية",
    dbName: "مسار 2",
    image: "/images/path2.jpg",
    subtitle: "رادار الاستمكان • 155ملم • 105ملم",
    description:
      "الأسلحة والأنظمة العسكرية الثقيلة التي تُستخدم لإطلاق النيران لمسافات بعيدة بهدف دعم القوات البرية وتدمير الأهداف المعادية.",
    capabilityCount: 19,
  },
  {
    name: "الدفاع الجوي",
    dbName: "مسار 3",
    image: "/images/path3.jpg",
    subtitle: "مضادات الدرونز • مدفعية وصواريخ دفاع جوي",
    description:
      "الأنظمة والأسلحة العسكرية التي تُستخدم لحماية المجال الجوي من الطائرات والصواريخ والطائرات بدون طيار المعادية.",
    capabilityCount: 20,
  },
  {
    name: "اسلحة طاقمية",
    dbName: "مسار 4",
    image: "/images/path4.jpg",
    subtitle: "مضادات الدروع • الهاون",
    description:
      "الأسلحة العسكرية التي تحتاج إلى أكثر من فرد لتشغيلها بسبب حجمها أو قوتها، مثل الرشاشات الثقيلة وقاذفات الهاون.",
    capabilityCount: 25,
  },
  {
    name: "الاتصالات",
    dbName: "مسار 5",
    image: "/images/path5.jpg",
    subtitle: "SDR • C4I",
    description:
      "الأنظمة والوسائل العسكرية التي تُستخدم لنقل المعلومات والأوامر بين الوحدات والقيادات، سواء كانت سلكية أو لاسلكية، لضمان التواصل المستمر أثناء العمليات.",
    capabilityCount: 28,
  },
  {
    name: "انظمة الرؤية والمراقبة",
    dbName: "مسار 6",
    image: "/images/path6.jpg",
    subtitle: "رادارات • انظمة رؤية",
    description:
      "الأجهزة والأنظمة العسكرية التي تُستخدم لرصد وتتبع الأهداف وجمع المعلومات الاستخبارية، مثل الكاميرات الحرارية والرادارات وأنظمة الرؤية الليلية.",
    capabilityCount: 38,
  },
  {
    name: "الانظمة الجوية",
    dbName: "مسار 7",
    image: "/images/path7.jpg",
    subtitle: "طائرات مسيرة استطلاعية • طائرات مسيرة مسلحة",
    description:
      "الطائرات العسكرية والأنظمة المرتبطة بها التي تُستخدم في القتال أو الاستطلاع أو النقل أو الدعم، بما فيها الطائرات المأهولة والطائرات بدون طيار.",
    capabilityCount: 15,
  },
  {
    name: "الاسلحة الخفيفة",
    dbName: "مسار 8",
    image: "/images/path8.jpg",
    subtitle: "بنادق • رشاشات • مسدسات",
    description:
      "الأسلحة الفردية المحمولة التي يستخدمها الجندي بشكل شخصي في القتال، مثل البنادق والمسدسات والرشاشات الخفيفة.",
    capabilityCount: 41,
  },
  {
    name: "الاسناد الهندسي",
    dbName: "مسار 9",
    image: "/images/path9.jpg",
    subtitle: "الهندسة الثقيلة • المتفجرات • اسلحة الدمار الشامل",
    description:
      "الأعمال والقدرات الهندسية العسكرية التي تُستخدم لدعم القوات في الميدان، مثل بناء التحصينات، فتح الطرق، إزالة الألغام، وإنشاء العوائق أو إزالتها.",
    capabilityCount: 33,
  },
  {
    name: "القدرات الطبية",
    dbName: "مسار 10",
    image: "/images/path10.jpg",
    subtitle: "السرايا الطبية",
    description:
      "الخدمات الطبية العسكرية التي تُقدم في ساحة القتال، وتشمل الإسعاف الأولي، علاج الإصابات، وإخلاء الجرحى من مناطق العمليات.",
    capabilityCount: 35,
  },
];

export function getPathBySlug(slug: string): PathConfig | undefined {
  const decoded = decodeURIComponent(slug);
  return MILITARY_PATHS.find(
    (p) => p.name === decoded || p.dbName === decoded
  );
}

export function getPathImage(pathName: string): string {
  const path = MILITARY_PATHS.find(
    (p) => p.name === pathName || p.dbName === pathName
  );
  return path?.image || "/images/path1.jpeg";
}

export function getDbNameFromSlug(slug: string): string {
  const decoded = decodeURIComponent(slug);
  const path = MILITARY_PATHS.find(
    (p) => p.name === decoded || p.dbName === decoded
  );
  return path?.dbName || decoded;
}
