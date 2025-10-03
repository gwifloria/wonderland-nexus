import { NextRequest, NextResponse } from "next/server";
import { lettersService } from "@/services/letters";

// GET /api/letters/detail
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId required" }, { status: 400 });
  }

  try {
    const result = await lettersService.getThreadDetail(threadId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[letters/detail] fetch failed:", error);

    if (error instanceof Error && error.message === "Thread not found") {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch thread detail" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
