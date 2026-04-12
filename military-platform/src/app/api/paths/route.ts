import { NextResponse } from "next/server";
import { getPathsWithCounts, initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    initializeDatabase();
    const paths = getPathsWithCounts();
    return NextResponse.json({ success: true, paths });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
