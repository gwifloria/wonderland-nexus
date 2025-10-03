import { blogService } from "@/services/blog";
import { BlogListResponse } from "@/types/blog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category || !["ByteNotes", "Murmurs"].includes(category)) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing category. Must be 'ByteNotes' or 'Murmurs'",
        },
        { status: 400 },
      );
    }

    // 直接调用服务层获取整合后的数据
    const data = await blogService.getBlogListWithPinData(category);

    const response: BlogListResponse = {
      success: true,
      data,
      category,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching blog list:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog list" },
      { status: 500 },
    );
  }
}
