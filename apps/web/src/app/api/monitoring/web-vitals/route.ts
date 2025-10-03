import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Web Vitals specific schema
const WebVitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["CLS", "FID", "FCP", "LCP", "TTFB", "INP"],
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
    id: String, // Web vitals ID
    navigationType: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    url: String,
    userId: String,
    sessionId: String,
    userAgent: String,
    deviceType: String, // mobile, tablet, desktop
    connectionType: String, // 4g, 3g, etc.
  },
  {
    timestamps: true,
    // Add TTL index to automatically delete old web vitals (90 days)
    expireAfterSeconds: 90 * 24 * 60 * 60,
  },
);

// Create indexes for efficient querying
WebVitalSchema.index({ timestamp: -1 });
WebVitalSchema.index({ name: 1, timestamp: -1 });
WebVitalSchema.index({ rating: 1, timestamp: -1 });
WebVitalSchema.index({ sessionId: 1 });
WebVitalSchema.index({ url: 1 });
WebVitalSchema.index({ deviceType: 1 });

const WebVital =
  mongoose.models.WebVital || mongoose.model("WebVital", WebVitalSchema);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const vitalData = await req.json();

    // Extract Web Vital name from metric name
    const webVitalName = vitalData.name
      ?.replace("web-vital-", "")
      .toUpperCase();

    // Validate Web Vital name
    const validNames = ["CLS", "FID", "FCP", "LCP", "TTFB", "INP"];
    if (!validNames.includes(webVitalName)) {
      return NextResponse.json(
        { error: "Invalid Web Vital name" },
        { status: 400 },
      );
    }

    // Validate required fields
    if (typeof vitalData.value !== "number" || !vitalData.rating) {
      return NextResponse.json(
        { error: "Missing required fields: value, rating" },
        { status: 400 },
      );
    }

    // Determine device type from user agent
    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = "desktop";
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad|Tablet/.test(userAgent) ? "tablet" : "mobile";
    }

    // Create Web Vital entry
    const webVital = new WebVital({
      name: webVitalName,
      value: vitalData.value,
      rating: vitalData.rating,
      id: vitalData.metadata?.id,
      navigationType: vitalData.metadata?.navigationType,
      timestamp: vitalData.timestamp
        ? new Date(vitalData.timestamp)
        : new Date(),
      url: vitalData.url,
      userId: vitalData.userId,
      sessionId: vitalData.sessionId,
      userAgent,
      deviceType,
      connectionType: vitalData.metadata?.connectionType,
    });

    await webVital.save();

    return NextResponse.json(
      { success: true, id: webVital._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving Web Vital:", error);
    return NextResponse.json(
      { error: "Failed to save Web Vital" },
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
    const deviceType = searchParams.get("deviceType");
    const url = searchParams.get("url");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const timeframe = searchParams.get("timeframe") || "24h";

    // Build query
    const query: any = {};
    if (name) query.name = name.toUpperCase();
    if (rating) query.rating = rating;
    if (deviceType) query.deviceType = deviceType;
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

    // Get Web Vitals with pagination
    const webVitals = await WebVital.find(query)
      .sort({ timestamp: -1 })
      .limit(Math.min(limit, 1000))
      .skip(offset)
      .lean();

    const total = await WebVital.countDocuments(query);

    // Get Core Web Vitals summary
    const summary = await WebVital.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          avgValue: { $avg: "$value" },
          p75Value: { $avg: "$value" },
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
      {
        $addFields: {
          goodPercentage: {
            $multiply: [{ $divide: ["$goodCount", "$count"] }, 100],
          },
          needsImprovementPercentage: {
            $multiply: [{ $divide: ["$needsImprovementCount", "$count"] }, 100],
          },
          poorPercentage: {
            $multiply: [{ $divide: ["$poorCount", "$count"] }, 100],
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get device type breakdown
    const deviceBreakdown = await WebVital.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 },
          avgLCP: {
            $avg: { $cond: [{ $eq: ["$name", "LCP"] }, "$value", null] },
          },
          avgFID: {
            $avg: { $cond: [{ $eq: ["$name", "FID"] }, "$value", null] },
          },
          avgCLS: {
            $avg: { $cond: [{ $eq: ["$name", "CLS"] }, "$value", null] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      webVitals,
      summary,
      deviceBreakdown,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + webVitals.length < total,
      },
      timeframe,
    });
  } catch (error) {
    console.error("Error fetching Web Vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch Web Vitals" },
      { status: 500 },
    );
  }
}
