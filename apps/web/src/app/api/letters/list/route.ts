import { NextRequest, NextResponse } from "next/server";
import { lettersService } from "@/services/letters";

// GET /api/letters/list - 线程列表（分页 + 搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await lettersService.getThreadsList({ q, page, limit });

    return NextResponse.json({
      message: "Threads retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("[letters/list] fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 },
    );
  }
}
