import { NextRequest, NextResponse } from "next/server";
import { getCapabilitiesByPath, initializeDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const pathName = request.nextUrl.searchParams.get("path");

    if (!pathName) {
      return NextResponse.json(
        { success: false, error: "Missing path parameter" },
        { status: 400 }
      );
    }

    const capabilities = getCapabilitiesByPath(pathName);
    return NextResponse.json({ success: true, capabilities });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
