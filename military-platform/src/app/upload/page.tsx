"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadResult {
  fileName: string;
  sheets: string[];
  keyDataRows: number;
  specialRows: number;
  generalRows: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      setError("يجب اختيار ملف Excel (.xlsx أو .xls)");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setResult(data.stats);
        setFile(null);
      } else {
        setError(data.error || "حدث خطأ أثناء رفع الملف");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">رفع البيانات</h1>
        <p className="text-sm text-text-muted mt-1">
          ارفع ملف Excel لتحديث قاعدة البيانات
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            dragOver ? "border-accent bg-accent-soft/30" : "border-line hover:border-accent/40"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <Upload size={40} className="mx-auto text-text-muted/40 mb-4" />
          <p className="text-sm text-text-muted mb-1">اسحب وأفلت ملف Excel هنا</p>
          <p className="text-xs text-text-muted/60">أو اضغط لاختيار ملف</p>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-accent-soft/30 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-accent-light" />
              <div>
                <p className="text-sm font-medium text-text">{file.name}</p>
                <p className="text-xs text-text-muted">
                  {(file.size / 1024).toFixed(1)} كيلوبايت
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-light transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin-slow" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "جاري الرفع..." : "رفع وتحديث"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-3 bg-danger/10 text-danger rounded-lg p-4 border border-danger/20">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 bg-accent2-soft rounded-lg p-5 border border-accent2/20">
            <div className="flex items-center gap-2 text-accent2 mb-3">
              <CheckCircle2 size={20} />
              <span className="font-medium text-sm">تم رفع البيانات بنجاح</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-text-muted text-xs">اسم الملف</p>
                <p className="font-medium text-text">{result.fileName}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">البيانات الأساسية</p>
                <p className="font-medium text-text">{result.keyDataRows} صف</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">المتطلبات الخاصة</p>
                <p className="font-medium text-text">{result.specialRows} صف</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">المتطلبات العامة</p>
                <p className="font-medium text-text">{result.generalRows} صف</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-medium text-accent-light mb-3">تعليمات هيكل الملف</h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>يجب أن يحتوي ملف Excel على الأوراق التالية:</p>
          <ul className="list-disc mr-5 space-y-1">
            <li>
              <span className="font-medium text-text">Key</span> — البيانات الأساسية
              (رمز القدرة، المسار، القدرة، القدرة الفرعية، النوع)
            </li>
            <li>
              <span className="font-medium text-text">نموذج عام - متطلب خاص</span> —
              التعريفات والمتطلبات العملياتية
            </li>
            <li>
              <span className="font-medium text-text">نموذج عام - متطلب عام</span> —
              المواصفات التفصيلية والشركات المصنعة
            </li>
          </ul>
          <p className="text-xs text-text-muted/70 mt-3">
            ملاحظة: رفع ملف جديد سيحل محل البيانات الحالية بالكامل
          </p>
        </div>
      </div>
    </div>
  );
}
