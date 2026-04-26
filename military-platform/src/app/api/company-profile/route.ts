import { NextRequest, NextResponse } from "next/server";
import {
  getCompaniesForType,
  getCompanyProfile,
  initializeDatabase,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || "";

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Missing code parameter" },
        { status: 400 }
      );
    }

    const company = searchParams.get("company");

    if (company) {
      const data = getCompanyProfile(code, company);
      if (!data.profile) {
        return NextResponse.json(
          { success: false, error: "Company profile not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, ...data });
    }

    const companies = getCompaniesForType(code);
    return NextResponse.json({ success: true, companies });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
