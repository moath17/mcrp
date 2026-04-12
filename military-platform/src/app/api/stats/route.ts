import { NextResponse } from "next/server";
import { getStats, initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    initializeDatabase();
    const stats = getStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
