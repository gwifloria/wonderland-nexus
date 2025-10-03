import { NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import GalleryImage from "@/app/api/models/GalleryImage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "16");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "desc" ? -1 : 1; // 默认按添加顺序（升序）

    await dbConnect();

    const skip = (page - 1) * limit;

    // Get paginated images from MongoDB
    const images = await GalleryImage.find({})
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await GalleryImage.countDocuments({});

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Format images for frontend
    const formattedImages = images.map((image) => ({
      name: image.filename,
      path: image.path,
      size: image.size,
      imageUrl: image.imageUrl,
      sha: image.sha,
      type: "image" as const,
    }));

    const firstImage = images[0];

    return NextResponse.json({
      images: formattedImages,
      directories: [], // No directories in cached version
      currentPath: "images",
      repo: firstImage?.repo || "gwifloria/eriko-gallery",
      branch: firstImage?.branch || "main",
      pagination: {
        page,
        limit,
        total,
        hasMore,
        totalPages,
      },
      cached: true,
      lastSync: firstImage?.updatedAt || firstImage?.createdAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gallery API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
