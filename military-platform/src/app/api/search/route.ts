import { NextRequest, NextResponse } from "next/server";
import { searchCapabilities, addLog, initializeDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const results = searchCapabilities(query, limit);

    if (query.trim()) {
      addLog("بحث", `بحث عن: "${query}" - ${(results as unknown[]).length} نتيجة`);
    }

    return NextResponse.json({ success: true, results, query });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
