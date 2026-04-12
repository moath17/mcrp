"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import CapabilityModal from "./CapabilityModal";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  onRowSelect?: (row: Record<string, unknown>) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  idKey?: string;
}

export default function DataTable({
  columns,
  data,
  onRowSelect,
  selectable = false,
  selectedRows,
  idKey = "capability_code",
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null);
  const pageSize = 15;

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = String(a[sortKey] || "");
      const bVal = String(b[sortKey] || "");
      return sortDir === "asc" ? aVal.localeCompare(bVal, "ar") : bVal.localeCompare(aVal, "ar");
    });
  }, [data, sortKey, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown size={14} className="text-muted/50" />;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <p className="text-muted">لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50/50 border-b border-border">
                {selectable && (
                  <th className="px-4 py-3 text-right font-medium text-muted w-12">
                    <span className="sr-only">اختيار</span>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-right font-medium text-muted whitespace-nowrap ${
                      col.sortable !== false ? "cursor-pointer hover:text-primary select-none" : ""
                    }`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && <SortIcon col={col.key} />}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const id = String(row[idKey] || idx);
                const isSelected = selectedRows?.has(id);
                return (
                  <tr
                    key={id + idx}
                    className={`border-b border-border/50 transition-colors ${
                      isSelected ? "bg-primary-50/30" : "hover:bg-background"
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onRowSelect?.(row)}
                          className="w-4 h-4 accent-primary rounded"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 max-w-[200px] truncate">
                        {String(row[col.key] || "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailRow(row)}
                        className="text-muted hover:text-primary transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background/50">
            <span className="text-xs text-muted">
              عرض {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} من {data.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pageNum = startPage + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 text-xs rounded-lg ${
                      pageNum === page
                        ? "bg-primary text-white"
                        : "border border-border hover:bg-surface"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
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
      </div>

      {detailRow && (
        <CapabilityModal
          data={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </>
  );
}
