export interface PathConfig {
  name: string;
  slug: string;
  image: string;
  subtitle: string;
}

export const MILITARY_PATHS: PathConfig[] = [
  {
    name: "العربات",
    slug: "العربات",
    image: "/images/path1.jpeg",
    subtitle: "قتالية • خدمة • اطفاء • اسعاف",
  },
  {
    name: "المدفعية",
    slug: "المدفعية",
    image: "/images/path2.jpg",
    subtitle: "رادار الاستمكان • 155ملم • 105ملم",
  },
  {
    name: "الدفاع الجوي",
    slug: "الدفاع الجوي",
    image: "/images/path3.jpg",
    subtitle: "مضادات الدرونز • مدفعية وصواريخ دفاع جوي",
  },
  {
    name: "اسلحة طاقمية",
    slug: "اسلحة طاقمية",
    image: "/images/path4.jpg",
    subtitle: "مضادات الدروع • الهاون",
  },
  {
    name: "الاتصالات",
    slug: "الاتصالات",
    image: "/images/path5.jpg",
    subtitle: "SDR • C4I",
  },
  {
    name: "انظمة الرؤية والمراقبة",
    slug: "انظمة الرؤية والمراقبة",
    image: "/images/path6.jpg",
    subtitle: "رادارات • انظمة رؤية",
  },
  {
    name: "الانظمة الجوية",
    slug: "الانظمة الجوية",
    image: "/images/path7.jpg",
    subtitle: "طائرات مسيرة استطلاعية • طائرات مسيرة مسلحة",
  },
  {
    name: "الاسلحة الخفيفة",
    slug: "الاسلحة الخفيفة",
    image: "/images/path8.jpg",
    subtitle: "بنادق • رشاشات • مسدسات",
  },
  {
    name: "الاسناد الهندسي",
    slug: "الاسناد الهندسي",
    image: "/images/path9.jpg",
    subtitle: "الهندسة الثقيلة • المتفجرات • اسلحة الدمار الشامل",
  },
  {
    name: "القدرات الطبية",
    slug: "القدرات الطبية",
    image: "/images/path10.jpg",
    subtitle: "السرايا الطبية",
  },
];

export function getPathBySlug(slug: string): PathConfig | undefined {
  const decoded = decodeURIComponent(slug);
  return MILITARY_PATHS.find((p) => p.slug === decoded || p.name === decoded);
}

export function getPathImage(pathName: string): string {
  const path = MILITARY_PATHS.find((p) => p.name === pathName || p.slug === pathName);
  return path?.image || "/images/path1.jpeg";
}
