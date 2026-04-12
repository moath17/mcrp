import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "منصة بحث القدرات العسكرية",
  description: "منصة داخلية لإدارة وتحليل بيانات القدرات العسكرية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="h-full bg-background">
        <Sidebar />
        <main className="md:mr-64 min-h-full">
          <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
