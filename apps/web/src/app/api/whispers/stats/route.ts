import { NextRequest, NextResponse } from "next/server";
import WhisperEntry from "@/app/api/models/WhisperEntry";
import { dbConnect } from "@wonderland/database";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "whisper";

    // Get various statistics
    const [totalEntries, totalWithImages, totalTags, recentEntries, tagCounts] =
      await Promise.all([
        // Total entries count
        WhisperEntry.countDocuments({ source }),

        // Entries with images
        WhisperEntry.countDocuments({
          source,
          images: { $exists: true, $ne: [] },
        }),

        // Get unique tags count
        WhisperEntry.aggregate([
          { $match: { source } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags" } },
          { $count: "totalTags" },
        ]).then((result) => result[0]?.totalTags || 0),

        // Recent entries (last 7 days)
        WhisperEntry.countDocuments({
          source,
          timestamp: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        }),

        // Top tags
        WhisperEntry.aggregate([
          { $match: { source } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

    // Get date range
    const [oldestEntry, newestEntry] = await Promise.all([
      WhisperEntry.findOne({ source })
        .sort({ timestamp: 1 })
        .select("timestamp"),
      WhisperEntry.findOne({ source })
        .sort({ timestamp: -1 })
        .select("timestamp"),
    ]);

    // Get entries by month for activity chart
    const monthlyActivity = await WhisperEntry.aggregate([
      { $match: { source } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    return NextResponse.json({
      overview: {
        totalEntries,
        totalWithImages,
        totalTags,
        recentEntries,
        dateRange: {
          oldest: oldestEntry?.timestamp,
          newest: newestEntry?.timestamp,
        },
      },
      topTags: tagCounts.map((tag) => ({
        name: tag._id,
        count: tag.count,
      })),
      monthlyActivity: monthlyActivity.map((month) => ({
        year: month._id.year,
        month: month._id.month,
        count: month.count,
        date: `${month._id.year}-${month._id.month.toString().padStart(2, "0")}`,
      })),
    });
  } catch (error) {
    console.error("Error fetching whisper stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
