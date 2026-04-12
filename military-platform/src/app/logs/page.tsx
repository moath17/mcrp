"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollText, RefreshCw, Loader2 } from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  action: string;
  details: string;
  ip: string;
}

const actionColors: Record<string, string> = {
  "بحث": "bg-accent-soft text-accent-light",
  "رفع ملف": "bg-accent2-soft text-accent2",
  "مقارنة": "bg-[rgba(168,85,247,0.15)] text-[#c084fc]",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const loadLogs = useCallback(() => {
    setLoading(true);
    fetch(`/api/logs?limit=${pageSize}&offset=${page * pageSize}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
          setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">سجل العمليات</h1>
          <p className="text-sm text-text-muted mt-1">
            توثيق جميع العمليات داخل المنصة
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 text-sm glass-panel rounded-lg hover:bg-glass text-text-muted hover:text-text transition-colors"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin-slow text-accent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <ScrollText size={40} className="mx-auto text-text-muted/30 mb-3" />
          <p className="text-text-muted text-sm">لا توجد عمليات مسجلة</p>
        </div>
      ) : (
        <>
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-glass">
                  <th className="px-4 py-3 text-right font-medium text-text-muted w-10">#</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">التاريخ والوقت</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">العملية</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-line/50 hover:bg-glass transition-colors">
                    <td className="px-4 py-3 text-text-muted text-xs">{log.id}</td>
                    <td className="px-4 py-3 text-xs text-text whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                          actionColors[log.action] || "bg-glass text-text-muted"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                إجمالي العمليات: {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-xs rounded-lg border border-line hover:bg-glass text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>
                <span className="px-3 py-1.5 text-xs text-text-muted">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-line hover:bg-glass text-text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
