import * as XLSX from "xlsx";

const KEY_COLUMNS: Record<string, string> = {
  "رمز القدرة": "capability_code",
  "المسار": "path",
  "القدرة": "capability",
  "القدرة الفرعية": "sub_capability",
  "النوع": "type",
};

const SPECIAL_COLUMNS: Record<string, string> = {
  "رمز القدرة": "capability_code",
  "النوع": "type",
  "تعريف القدرة": "definition",
  "المتطلبات العملياتية": "operational_requirements",
  "سيناريوهات ومتطلبات التجارب": "scenarios",
  "العنصر الفرعية المكونة للقدرة": "sub_elements",
  "الوحدات المستخدمة للقدرة": "units_used",
  "الجهات المحلية المستخدمة للقدرة": "local_entities",
  "الشركات المصنعة للقدرة (العالمية)": "manufacturers",
};

const GENERAL_COLUMNS: Record<string, string> = {
  "رمز القدرة": "capability_code",
  "النوع": "type",
  "اسم القدرة": "capability_name",
  "اسم الشركة": "company_name",
  "تعريف بالشركة": "company_info",
  "نطاق التعريف للقدرة": "scope_definition",
  "تاريخ التطوير الخاص بالقدرة": "development_history",
  "التسليح والذخائر/الصواريخ": "armament",
  "تكلفة القدرة": "cost",
  "عائلة القدرة والانواع المتاحة": "family",
  "المواصفات الفنية": "technical_specs",
  "الدول والقوات المستخدمة للقدرة": "countries_used",
  "متطلبات التدريب": "training_requirements",
  "حالة التوطين للقدرة": "localization_status",
  "تشكيل المنظومة (ان وجدت)": "system_formation",
  "الاختبارات المصنعية للقدرة": "factory_tests",
  "متطلبات التخزين والاستدامة": "storage_requirements",
  "الأنظمة الفرعية المرتبطة بالقدرة": "sub_systems",
  "مشاركة القدرة في النزاعات": "conflict_participation",
};

function mapRow(row: Record<string, unknown>, columnMap: Record<string, string>): Record<string, string> {
  const mapped: Record<string, string> = {};
  const reverseMap = new Map<string, string>();

  for (const [arabic, english] of Object.entries(columnMap)) {
    reverseMap.set(arabic, english);
    mapped[english] = "";
  }

  for (const [key, value] of Object.entries(row)) {
    const trimmedKey = key.trim();
    const englishKey = reverseMap.get(trimmedKey);
    if (englishKey) {
      mapped[englishKey] = value != null ? String(value).trim() : "";
    }
  }

  return mapped;
}

function findSheetByPattern(sheetNames: string[], patterns: string[]): string | undefined {
  return sheetNames.find((name) => patterns.some((p) => name.includes(p)));
}

export function parseExcelBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetNames = workbook.SheetNames;

  const keySheetName = findSheetByPattern(sheetNames, ["Key", "key", "المفتاح"]) || sheetNames[0];
  const specialSheetName = findSheetByPattern(sheetNames, ["متطلب خاص", "خاص"]) || sheetNames[1];
  const generalSheetName = findSheetByPattern(sheetNames, ["متطلب عام", "عام"]) || sheetNames[2];

  const parseSheet = (
    sheetName: string | undefined,
    columnMap: Record<string, string>,
    skipExampleRow: boolean
  ) => {
    if (!sheetName || !workbook.Sheets[sheetName]) return [];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (rawRows.length === 0) return [];

    const dataRows = skipExampleRow ? rawRows.slice(1) : rawRows;

    return dataRows
      .map((row) => mapRow(row, columnMap))
      .filter((row) => row.capability_code && row.capability_code.trim() !== "");
  };

  // Key sheet starts with real data (no instructional/example row).
  // Special/General sheets have an example row at index 0 to skip.
  const keyData = parseSheet(keySheetName, KEY_COLUMNS, false);
  const specialData = parseSheet(specialSheetName, SPECIAL_COLUMNS, true);
  const generalData = parseSheet(generalSheetName, GENERAL_COLUMNS, true);

  return { keyData, specialData, generalData, sheetNames };
}
