import { ApiResponse, LabListResponse, LabStatus, LabType } from "@/types/lab";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import Lab, { ILab } from "@/app/api/models/Lab";

// GET /api/labs - 获取 labs 列表
export async function GET(
  request: NextRequest,
): Promise<NextResponse<LabListResponse | ApiResponse>> {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as LabType | null;
    const status = searchParams.get("status") as LabStatus | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);

    let query: any = {};

    if (type && ["bug", "issue", "idea"].includes(type)) {
      query.type = type;
    }
    if (status && ["open", "inProgress", "resolved"].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const labs = await Lab.find(query)
      .sort({ createdAt: -1 })
      .select("title type status content category createdAt updatedAt")
      .limit(limit)
      .skip((page - 1) * limit)
      .lean<ILab[]>();

    const total = await Lab.countDocuments(query);

    // 转换数据格式
    const data = labs.map((doc) => ({
      id: (doc._id as any).toString(),
      title: doc.title,
      type: doc.type,
      status: doc.status,
      content: doc.content,
      category: doc.category,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({
      message: "Labs retrieved successfully",
      data: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lab list fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch labs" },
      { status: 500 },
    );
  }
}
