import { NextRequest, NextResponse } from "next/server";
import WhisperEntry from "@/app/api/models/WhisperEntry";
import { dbConnect } from "@wonderland/database";
import { deleteImagesByUrls } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // First, fetch all entries to get image URLs before deletion
    const entriesToDelete = await WhisperEntry.find({
      source: "whisper",
    }).lean();

    // Collect all image URLs from all entries
    const allImageUrls: string[] = [];
    for (const entry of entriesToDelete) {
      if (entry.images && entry.images.length > 0) {
        allImageUrls.push(...entry.images);
      }
    }

    console.log(
      `Found ${allImageUrls.length} images across ${entriesToDelete.length} entries`,
    );

    // Delete images from Cloudinary (if any)
    let cloudinaryResult = { deleted: [] as string[], failed: [] as string[] };
    if (allImageUrls.length > 0) {
      try {
        cloudinaryResult = await deleteImagesByUrls(allImageUrls);
        console.log(
          `Deleted ${cloudinaryResult.deleted.length} images from Cloudinary`,
        );
        if (cloudinaryResult.failed.length > 0) {
          console.warn(
            `Failed to delete ${cloudinaryResult.failed.length} images from Cloudinary`,
          );
        }
      } catch (cloudinaryError) {
        // Log error but continue with MongoDB deletion
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError,
        );
      }
    }

    // Delete all whisper entries from MongoDB
    const result = await WhisperEntry.deleteMany({ source: "whisper" });

    return NextResponse.json({
      success: true,
      message: "所有 whisper 记录已清空",
      deletedCount: result.deletedCount,
      cloudinaryDeleted: cloudinaryResult.deleted.length,
      cloudinaryFailed: cloudinaryResult.failed.length,
    });
  } catch (error) {
    console.error("Error clearing whisper entries:", error);
    return NextResponse.json(
      {
        error: "Failed to clear entries",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to clear." },
    { status: 405 },
  );
}
