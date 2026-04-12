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
  "بحث": "bg-blue-50 text-blue-700",
  "رفع ملف": "bg-green-50 text-green-700",
  "مقارنة": "bg-purple-50 text-purple-700",
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
          <h1 className="text-2xl font-bold text-primary">سجل العمليات</h1>
          <p className="text-sm text-muted mt-1">
            توثيق جميع العمليات داخل المنصة
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-background transition-colors"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin-slow text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <ScrollText size={40} className="mx-auto text-muted/30 mb-3" />
          <p className="text-muted text-sm">لا توجد عمليات مسجلة</p>
        </div>
      ) : (
        <>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50/50 border-b border-border">
                  <th className="px-4 py-3 text-right font-medium text-muted w-10">#</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">التاريخ والوقت</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">العملية</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-background">
                    <td className="px-4 py-3 text-muted text-xs">{log.id}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                          actionColors[log.action] || "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                إجمالي العمليات: {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="px-3 py-1.5 text-xs text-muted">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
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
