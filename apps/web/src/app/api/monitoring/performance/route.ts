import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Performance metric schema
const PerformanceMetricSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    rating: {
      type: String,
      enum: ["good", "needs-improvement", "poor"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    url: String,
    userId: String,
    sessionId: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Add TTL index to automatically delete old metrics (90 days)
    expireAfterSeconds: 90 * 24 * 60 * 60,
  },
);

// Create indexes for efficient querying
PerformanceMetricSchema.index({ timestamp: -1 });
PerformanceMetricSchema.index({ name: 1, timestamp: -1 });
PerformanceMetricSchema.index({ rating: 1, timestamp: -1 });
PerformanceMetricSchema.index({ sessionId: 1 });
PerformanceMetricSchema.index({ url: 1 });

const PerformanceMetric =
  mongoose.models.PerformanceMetric ||
  mongoose.model("PerformanceMetric", PerformanceMetricSchema);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const metricData = await req.json();

    // Validate required fields
    if (
      !metricData.name ||
      typeof metricData.value !== "number" ||
      !metricData.rating
    ) {
      return NextResponse.json(
        { error: "Missing required fields: name, value, rating" },
        { status: 400 },
      );
    }

    // Validate rating
    const validRatings = ["good", "needs-improvement", "poor"];
    if (!validRatings.includes(metricData.rating)) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 },
      );
    }

    // Create performance metric
    const metric = new PerformanceMetric({
      name: metricData.name,
      value: metricData.value,
      rating: metricData.rating,
      timestamp: metricData.timestamp
        ? new Date(metricData.timestamp)
        : new Date(),
      url: metricData.url,
      userId: metricData.userId,
      sessionId: metricData.sessionId,
      metadata: metricData.metadata || {},
    });

    await metric.save();

    return NextResponse.json(
      { success: true, id: metric._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving performance metric:", error);
    return NextResponse.json(
      { error: "Failed to save performance metric" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const rating = searchParams.get("rating");
    const sessionId = searchParams.get("sessionId");
    const url = searchParams.get("url");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const timeframe = searchParams.get("timeframe") || "24h"; // 1h, 24h, 7d, 30d

    // Build query
    const query: any = {};
    if (name) query.name = name;
    if (rating) query.rating = rating;
    if (sessionId) query.sessionId = sessionId;
    if (url) query.url = url;

    // Add time filter
    const now = new Date();
    let startTime: Date;
    switch (timeframe) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    query.timestamp = { $gte: startTime };

    // Get metrics with pagination
    const metrics = await PerformanceMetric.find(query)
      .sort({ timestamp: -1 })
      .limit(Math.min(limit, 1000))
      .skip(offset)
      .lean();

    const total = await PerformanceMetric.countDocuments(query);

    // Get aggregated statistics
    const stats = await PerformanceMetric.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          avgValue: { $avg: "$value" },
          minValue: { $min: "$value" },
          maxValue: { $max: "$value" },
          goodCount: {
            $sum: { $cond: [{ $eq: ["$rating", "good"] }, 1, 0] },
          },
          needsImprovementCount: {
            $sum: { $cond: [{ $eq: ["$rating", "needs-improvement"] }, 1, 0] },
          },
          poorCount: {
            $sum: { $cond: [{ $eq: ["$rating", "poor"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      metrics,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + metrics.length < total,
      },
      timeframe,
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance metrics" },
      { status: 500 },
    );
  }
}
