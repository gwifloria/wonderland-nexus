import { githubService } from "@/services/github";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // always run on server
export const revalidate = 3600; // cache responses for 1h

/**
 * GET /api/posts/metadata?path=<dir/file.md>
 * Returns the latest commit info for a given file
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

    const commitInfo = await githubService.getCommitInfo(path);

    return NextResponse.json({
      success: true,
      ...commitInfo,
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);

    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 },
    );
  }
}
