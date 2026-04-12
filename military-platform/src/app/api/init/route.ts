import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db";

export async function POST() {
  try {
    initializeDatabase();
    return NextResponse.json({ success: true, message: "تم تهيئة قاعدة البيانات بنجاح" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
