import { NextRequest, NextResponse } from "next/server";
import {
  initializeDatabase,
  clearData,
  insertKeyData,
  insertSpecialRequirements,
  insertGeneralRequirements,
  rebuildSearchIndex,
  addLog,
  setDataSource,
} from "@/lib/db";
import { parseExcelBuffer } from "@/lib/excel";

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ success: false, error: "يجب رفع ملف Excel (.xlsx أو .xls)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { keyData, specialData, generalData, sheetNames } = parseExcelBuffer(buffer);

    clearData();

    if (keyData.length > 0) insertKeyData(keyData);
    if (specialData.length > 0) insertSpecialRequirements(specialData);
    if (generalData.length > 0) insertGeneralRequirements(generalData);

    rebuildSearchIndex();
    setDataSource("upload", file.name);

    const summary = `تم رفع الملف "${file.name}" - الأوراق: ${sheetNames.join(", ")} - البيانات الأساسية: ${keyData.length} صف، المتطلبات الخاصة: ${specialData.length} صف، المتطلبات العامة: ${generalData.length} صف`;
    addLog("رفع ملف", summary);

    return NextResponse.json({
      success: true,
      message: "تم رفع وتحديث البيانات بنجاح",
      stats: {
        fileName: file.name,
        sheets: sheetNames,
        keyDataRows: keyData.length,
        specialRows: specialData.length,
        generalRows: generalData.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
