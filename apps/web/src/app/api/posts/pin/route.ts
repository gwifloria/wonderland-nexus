import { blogService } from "@/services/blog";
import { NextRequest, NextResponse } from "next/server";

interface PinRequest {
  path: string;
  category: string;
  title: string;
  isPinned: boolean;
  pinOrder?: number;
}

// POST /api/posts/pin - Toggle pin status for a blog post
export async function POST(request: NextRequest) {
  try {
    const { path, category, title, isPinned, pinOrder }: PinRequest =
      await request.json();

    if (!path || !category || !title || typeof isPinned !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: path, category, title, isPinned" },
        { status: 400 },
      );
    }

    const success = await blogService.updatePostPinStatus(
      path,
      category,
      title,
      isPinned,
      pinOrder,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update pin status" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: isPinned
        ? "Post pinned successfully"
        : "Post unpinned successfully",
    });
  } catch (error) {
    console.error("[posts/pin] POST failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
