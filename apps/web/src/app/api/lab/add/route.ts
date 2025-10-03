import { ApiResponse, LabCreateInput } from "@/types/lab";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../lib/api-helpers";
import { dbConnect } from "@wonderland/database";
import Lab, { ILab } from "@/app/api/models/Lab";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ILab>>> {
  try {
    await dbConnect();

    const body: LabCreateInput = await request.json();
    const { title, content, type, status = "open", category } = body;

    if (!title || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, or category" },
        { status: 400 },
      );
    }

    // 验证 type 和 status 值
    if (!["bug", "issue", "idea"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'bug', 'issue', or 'idea'" },
        { status: 400 },
      );
    }

    if (!["open", "inProgress", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'open', 'inProgress', or 'resolved'" },
        { status: 400 },
      );
    }

    const lab = new Lab({
      title,
      content,
      type,
      status,
      category,
    });

    await lab.save();

    return NextResponse.json(
      {
        message: "Lab created successfully",
        data: lab,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Lab creation failed:", error);
    return handleError(error);
  }
}
