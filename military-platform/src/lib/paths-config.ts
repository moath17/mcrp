export interface PathConfig {
  name: string;
  dbName: string;
  image: string;
  subtitle: string;
  capabilityCount: number;
}

export const MILITARY_PATHS: PathConfig[] = [
  {
    name: "العربات",
    dbName: "مسار 1",
    image: "/images/path1.jpeg",
    subtitle: "قتالية • خدمة • اطفاء • اسعاف",
    capabilityCount: 9,
  },
  {
    name: "المدفعية",
    dbName: "مسار 2",
    image: "/images/path2.jpg",
    subtitle: "رادار الاستمكان • 155ملم • 105ملم",
    capabilityCount: 19,
  },
  {
    name: "الدفاع الجوي",
    dbName: "مسار 3",
    image: "/images/path3.jpg",
    subtitle: "مضادات الدرونز • مدفعية وصواريخ دفاع جوي",
    capabilityCount: 20,
  },
  {
    name: "اسلحة طاقمية",
    dbName: "مسار 4",
    image: "/images/path4.jpg",
    subtitle: "مضادات الدروع • الهاون",
    capabilityCount: 25,
  },
  {
    name: "الاتصالات",
    dbName: "مسار 5",
    image: "/images/path5.jpg",
    subtitle: "SDR • C4I",
    capabilityCount: 28,
  },
  {
    name: "انظمة الرؤية والمراقبة",
    dbName: "مسار 6",
    image: "/images/path6.jpg",
    subtitle: "رادارات • انظمة رؤية",
    capabilityCount: 38,
  },
  {
    name: "الانظمة الجوية",
    dbName: "مسار 7",
    image: "/images/path7.jpg",
    subtitle: "طائرات مسيرة استطلاعية • طائرات مسيرة مسلحة",
    capabilityCount: 15,
  },
  {
    name: "الاسلحة الخفيفة",
    dbName: "مسار 8",
    image: "/images/path8.jpg",
    subtitle: "بنادق • رشاشات • مسدسات",
    capabilityCount: 41,
  },
  {
    name: "الاسناد الهندسي",
    dbName: "مسار 9",
    image: "/images/path9.jpg",
    subtitle: "الهندسة الثقيلة • المتفجرات • اسلحة الدمار الشامل",
    capabilityCount: 33,
  },
  {
    name: "القدرات الطبية",
    dbName: "مسار 10",
    image: "/images/path10.jpg",
    subtitle: "السرايا الطبية",
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
