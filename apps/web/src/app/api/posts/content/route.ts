import { githubService } from "@/services/github";
import { NextResponse } from "next/server";

export const revalidate = 0; // always dynamic; do not statically cache
export const dynamic = "force-dynamic";

/**
 * GET /api/posts/content?path=<dir/file.md>
 * Returns raw markdown content and parsed metadata from GitHub repository
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing ?path parameter" },
        { status: 400 },
      );
    }
    console.log(path);
    const blogContent = await githubService.getFileContent(path);

    return NextResponse.json({
      success: true,
      content: blogContent.content,
      meta: blogContent.meta,
    });
  } catch (error) {
    console.error("Error fetching content:", error);

    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 },
    );
  }
}
