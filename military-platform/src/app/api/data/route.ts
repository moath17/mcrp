import { NextRequest, NextResponse } from "next/server";
import {
  getFilteredData,
  getFilterOptions,
  getCapabilityDetails,
  getAllCapabilityCodes,
  initializeDatabase,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";

    if (action === "filters") {
      const options = getFilterOptions();
      return NextResponse.json({ success: true, ...options });
    }

    if (action === "detail") {
      const code = searchParams.get("code") || "";
      const detail = getCapabilityDetails(code);
      return NextResponse.json({ success: true, ...detail });
    }

    if (action === "codes") {
      const codes = getAllCapabilityCodes();
      return NextResponse.json({ success: true, codes });
    }

    const filters: Record<string, string> = {};
    for (const key of ["path", "capability", "type", "sub_capability", "localization_status"]) {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    }

    const results = getFilteredData(filters);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
