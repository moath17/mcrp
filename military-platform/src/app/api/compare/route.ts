import { NextRequest, NextResponse } from "next/server";
import { getComparisonData, addLog, initializeDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const body = await request.json();
    const codes: string[] = body.codes || [];

    if (codes.length < 2) {
      return NextResponse.json({ success: false, error: "يجب اختيار قدرتين على الأقل للمقارنة" }, { status: 400 });
    }

    const results = getComparisonData(codes);
    addLog("مقارنة", `مقارنة بين: ${codes.join(", ")}`);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
