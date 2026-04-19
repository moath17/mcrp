import { NextRequest, NextResponse } from "next/server";
import {
  initializeDatabase,
  getCodesWithGeneralData,
  getCompaniesForCode,
  getCodeAggregate,
  getCompanyRow,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const params = request.nextUrl.searchParams;
    const action = params.get("action");

    if (action === "codes") {
      return NextResponse.json({ success: true, codes: getCodesWithGeneralData() });
    }

    if (action === "companies") {
      const code = params.get("code");
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Missing code parameter" },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, companies: getCompaniesForCode(code) });
    }

    if (action === "code") {
      const code = params.get("code");
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Missing code parameter" },
          { status: 400 }
        );
      }
      const aggregate = getCodeAggregate(code);
      if (!aggregate) {
        return NextResponse.json(
          { success: false, error: "Code not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: aggregate });
    }

    if (action === "company") {
      const code = params.get("code");
      const company = params.get("company");
      if (!code || !company) {
        return NextResponse.json(
          { success: false, error: "Missing code or company parameter" },
          { status: 400 }
        );
      }
      const row = getCompanyRow(code, company);
      if (!row) {
        return NextResponse.json(
          { success: false, error: "Company row not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: row });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
