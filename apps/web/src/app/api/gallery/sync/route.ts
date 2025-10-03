import { dbConnect } from "@wonderland/database";
import GalleryImage from "@/app/api/models/GalleryImage";
import { NextResponse } from "next/server";
import { GitHubFileBase } from "@/types/common";

export const dynamic = "force-dynamic";

// 使用基础 GitHub 文件类型
type GitHubFileItem = GitHubFileBase;

export async function POST(req: Request) {
  try {
    await dbConnect();

    const repo = "eriko-gallery";
    const dir = "images";
    const owner = process.env.GITHUB_OWNER || "gwifloria";
    const branch = process.env.GITHUB_BRANCH || "main";
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN required for private repo access" },
        { status: 401 },
      );
    }

    // Fetch all images from GitHub API
    const api = `https://api.github.com/repos/${encodeURIComponent(
      owner,
    )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
      dir,
    )}?ref=${encodeURIComponent(branch)}`;

    const res = await fetch(api, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const status = res.status;
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `GitHub API returned ${status}`, detail: text },
        { status },
      );
    }

    const payload = await res.json();
    const itemsArray = Array.isArray(payload) ? payload : [payload];

    // Filter for image files
    const imageExtensions = /\.(avif)$/i;
    const imageItems = itemsArray.filter(
      (item: GitHubFileItem) =>
        item && item.type === "file" && imageExtensions.test(item.name),
    );

    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each image
    for (const item of imageItems) {
      try {
        const existingImage = await GalleryImage.findOne({ path: item.path });

        if (existingImage) {
          // Check if SHA has changed (file updated)
          if (existingImage.sha !== item.sha) {
            await GalleryImage.updateOne(
              { path: item.path },
              {
                filename: item.name,
                sha: item.sha,
                size: item.size,
                imageUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
                updatedAt: new Date(),
              },
            );
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Create new image record
          await GalleryImage.create({
            filename: item.name,
            path: item.path,
            sha: item.sha,
            size: item.size,
            repo: `${owner}/${repo}`,
            branch,
            imageUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
          });
          newCount++;
        }
      } catch (error) {
        console.error(`Failed to process image ${item.path}:`, error);
        errorCount++;
        // Continue processing other images instead of failing entirely
      }
    }

    // Remove images that no longer exist in GitHub
    const currentPaths = imageItems.map((item: GitHubFileItem) => item.path);
    const deleteResult = await GalleryImage.deleteMany({
      path: { $nin: currentPaths },
    });
    const deletedCount = deleteResult.deletedCount || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total: imageItems.length,
        new: newCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorCount,
        deleted: deletedCount,
      },
      syncTime: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Sync error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
