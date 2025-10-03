import { NextRequest, NextResponse } from "next/server";
import { lettersService } from "@/services/letters";

// GET /api/letters/comments - Get comments for a thread
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "threadId required" }, { status: 400 });
    }

    const comments = await lettersService.getThreadComments(threadId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("[letters/comments] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

// POST /api/letters/comments - Add a new comment
export async function POST(req: NextRequest) {
  try {
    const { threadId, content, author } = await req.json();

    if (!threadId) {
      return NextResponse.json({ error: "threadId required" }, { status: 400 });
    }

    if (!author || !author.name || !author.address) {
      return NextResponse.json(
        { error: "author is required" },
        { status: 400 },
      );
    }

    const comment = await lettersService.createComment({
      threadId,
      content,
      author,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[letters/comments] POST failed:", error);

    if (
      error instanceof Error &&
      (error.message === "Content is required" ||
        error.message === "Comment too long")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

// DELETE /api/letters/comments - Delete a comment
export async function DELETE(req: NextRequest) {
  try {
    const { commentId, address } = await req.json();

    if (!commentId || !address) {
      return NextResponse.json(
        { error: "Missing commentId or address" },
        { status: 400 },
      );
    }

    await lettersService.deleteComment(commentId, address);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[letters/comments] DELETE failed:", error);

    if (error instanceof Error && error.message === "Comment not found") {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
