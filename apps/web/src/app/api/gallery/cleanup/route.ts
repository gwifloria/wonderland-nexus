import { dbConnect } from "@wonderland/database";
import GalleryImage from "@/app/api/models/GalleryImage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Count existing images before cleanup
    const existingCount = await GalleryImage.countDocuments({});

    // Delete all gallery images
    const deleteResult = await GalleryImage.deleteMany({});
    const deletedCount = deleteResult.deletedCount || 0;

    console.log(`Cleanup completed: ${deletedCount} images removed`);

    return NextResponse.json({
      success: true,
      message: "Gallery database cleaned successfully",
      stats: {
        existingCount,
        deletedCount,
      },
      cleanupTime: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Cleanup error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
