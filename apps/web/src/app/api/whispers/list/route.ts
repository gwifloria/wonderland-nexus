import { NextRequest, NextResponse } from "next/server";
import WhisperEntry from "@/app/api/models/WhisperEntry";
import { dbConnect } from "@wonderland/database";
import { WhisperListResponse } from "@/types/whisper";
import { deleteImagesByUrls } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const visibility = searchParams.get("visibility") || "private";
    const source = searchParams.get("source") || "whisper";
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    // Build query
    const query: any = {
      visibility,
      source,
    };

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [entries, total] = await Promise.all([
      WhisperEntry.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      WhisperEntry.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Format entries for response
    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      content: entry.content,
      images: entry.images,
      tags: entry.tags,
      source: entry.source,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      // Include content preview for timeline view
      contentPreview:
        entry.content.length > 200
          ? entry.content.substring(0, 200) + "..."
          : entry.content,
    }));

    return NextResponse.json({
      data: formattedEntries,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        visibility,
        source,
        tag,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching whisper entries:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch entries",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 },
      );
    }

    // First, find the entry to get image URLs before deletion
    const entryToDelete = await WhisperEntry.findById(id);

    if (!entryToDelete) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete associated Cloudinary images (if any)
    if (entryToDelete.images && entryToDelete.images.length > 0) {
      try {
        const result = await deleteImagesByUrls(entryToDelete.images);
        console.log(
          `Deleted ${result.deleted.length} images from Cloudinary for entry ${id}`,
        );
        if (result.failed.length > 0) {
          console.warn(
            `Failed to delete ${result.failed.length} images from Cloudinary`,
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

    // Delete the MongoDB entry
    await WhisperEntry.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting whisper entry:", error);
    return NextResponse.json(
      {
        error: "Failed to delete entry",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
