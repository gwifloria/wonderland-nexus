import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Log entry schema
const LogEntrySchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["debug", "info", "warn", "error"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userId: String,
    sessionId: String,
    url: String,
    userAgent: String,
    // Add indexing for efficient queries
  },
  {
    timestamps: true,
    // Add TTL index to automatically delete old logs (30 days)
    expireAfterSeconds: 30 * 24 * 60 * 60,
  },
);

// Create index for efficient querying
LogEntrySchema.index({ timestamp: -1 });
LogEntrySchema.index({ level: 1, timestamp: -1 });
LogEntrySchema.index({ sessionId: 1 });

const LogEntry =
  mongoose.models.LogEntry || mongoose.model("LogEntry", LogEntrySchema);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const logData = await req.json();

    // Validate required fields
    if (!logData.level || !logData.message) {
      return NextResponse.json(
        { error: "Missing required fields: level, message" },
        { status: 400 },
      );
    }

    // Sanitize and validate log level
    const validLevels = ["debug", "info", "warn", "error"];
    if (!validLevels.includes(logData.level)) {
      return NextResponse.json({ error: "Invalid log level" }, { status: 400 });
    }

    // Create log entry
    const logEntry = new LogEntry({
      level: logData.level,
      message: logData.message,
      context: logData.context || {},
      timestamp: logData.timestamp ? new Date(logData.timestamp) : new Date(),
      userId: logData.userId,
      sessionId: logData.sessionId,
      url: logData.url,
      userAgent: logData.userAgent,
    });

    await logEntry.save();

    return NextResponse.json(
      { success: true, id: logEntry._id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving log entry:", error);
    return NextResponse.json(
      { error: "Failed to save log entry" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: any = {};
    if (level) query.level = level;
    if (sessionId) query.sessionId = sessionId;

    // Get logs with pagination
    const logs = await LogEntry.find(query)
      .sort({ timestamp: -1 })
      .limit(Math.min(limit, 1000)) // Cap at 1000
      .skip(offset)
      .lean();

    const total = await LogEntry.countDocuments(query);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
