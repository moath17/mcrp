"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import DataTable from "@/components/DataTable";

type SearchResult = Record<string, unknown>;

const columns = [
  { key: "capability_code", label: "رمز القدرة" },
  { key: "capability", label: "القدرة" },
  { key: "sub_capability", label: "القدرة الفرعية" },
  { key: "type", label: "النوع" },
  { key: "path", label: "المسار" },
  { key: "company_name", label: "الشركة" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResults(data.results);
        }
        setSearched(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">البحث الذكي</h1>
        <p className="text-sm text-muted mt-1">ابحث في قاعدة البيانات بالكلمات المفتاحية</p>
      </div>

      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={20} className="animate-spin-slow text-primary" />
          ) : (
            <Search size={20} className="text-muted" />
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ابحث برمز القدرة، اسم الشركة، النوع، المواصفات..."
          className="w-full pr-12 pl-4 py-4 bg-surface border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted/50 shadow-sm"
        />
      </div>

      {!searched && !loading && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Sparkles size={40} className="mx-auto text-secondary mb-3" />
          <p className="text-muted text-sm">
            ابدأ بكتابة كلمة للبحث — النتائج تظهر فوراً أثناء الكتابة
          </p>
        </div>
      )}

      {searched && (
        <div>
          <p className="text-xs text-muted mb-3">
            {results.length > 0
              ? `تم العثور على ${results.length} نتيجة`
              : "لم يتم العثور على نتائج"}
          </p>
          <DataTable columns={columns} data={results} />
        </div>
      )}
    </div>
  );
}
