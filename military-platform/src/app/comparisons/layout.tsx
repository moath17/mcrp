import Sidebar from "@/components/Sidebar";

export default function ComparisonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Sidebar />
      <main className="md:mr-64 min-h-full">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
