import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "موسوعة القدرات العسكرية",
  description: "منصة داخلية لإدارة وتحليل بيانات القدرات العسكرية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="h-full bg-bg text-text">{children}</body>
    </html>
  );
}
