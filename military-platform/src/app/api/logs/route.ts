import { NextRequest, NextResponse } from "next/server";
import { getLogs, initializeDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { logs, total } = getLogs(limit, offset);
    return NextResponse.json({ success: true, logs, total });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
