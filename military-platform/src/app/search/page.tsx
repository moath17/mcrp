"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

type SearchResult = Record<string, string>;

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
        <h1 className="text-2xl font-bold text-text">البحث الذكي</h1>
        <p className="text-sm text-text-muted mt-1">ابحث في قاعدة البيانات بالكلمات المفتاحية</p>
      </div>

      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={20} className="animate-spin-slow text-accent" />
          ) : (
            <Search size={20} className="text-text-muted" />
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ابحث برمز القدرة، اسم الشركة، النوع، المواصفات..."
          className="w-full pr-12 pl-4 py-4 bg-surface border border-line rounded-xl text-base text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-text-muted/50"
        />
      </div>

      {!searched && !loading && (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Sparkles size={40} className="mx-auto text-accent2 mb-3" />
          <p className="text-text-muted text-sm">
            ابدأ بكتابة كلمة للبحث — النتائج تظهر فوراً أثناء الكتابة
          </p>
        </div>
      )}

      {searched && (
        <div>
          <p className="text-xs text-text-muted mb-3">
            {results.length > 0
              ? `تم العثور على ${results.length} نتيجة`
              : "لم يتم العثور على نتائج"}
          </p>
          {results.length > 0 && (
            <div className="glass-panel rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-glass">
                    <th className="px-4 py-3 text-right font-medium text-text-muted">رمز القدرة</th>
                    <th className="px-4 py-3 text-right font-medium text-text-muted">القدرة</th>
                    <th className="px-4 py-3 text-right font-medium text-text-muted">النوع</th>
                    <th className="px-4 py-3 text-right font-medium text-text-muted">المسار</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-line/50 hover:bg-glass transition-colors">
                      <td className="px-4 py-3 text-xs text-accent-light">
                        <Link
                          href={`/path/${encodeURIComponent(r.path || "")}/type/${encodeURIComponent(r.capability_code || "")}`}
                          className="hover:underline"
                        >
                          {r.capability_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text">{r.capability}</td>
                      <td className="px-4 py-3 text-text-muted">{r.type}</td>
                      <td className="px-4 py-3 text-text-muted">{r.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
