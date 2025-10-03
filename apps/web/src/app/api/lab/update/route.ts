import { ApiResponse } from "@/types/lab";
import { NextRequest, NextResponse } from "next/server";
import { handleError, validateObjectId } from "../../lib/api-helpers";
import { dbConnect } from "@wonderland/database";
import Lab, { ILab } from "@/app/api/models/Lab";
import { LabUpdateInput } from "@/types/lab";

// PUT /api/lab/update - 更新 lab
export async function PUT(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ILab>>> {
  try {
    await dbConnect();

    const body: LabUpdateInput & { id: string } = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required in request body" },
        { status: 400 },
      );
    }

    const idValidation = validateObjectId(id);
    if (idValidation) return idValidation;

    // 验证字段值
    if (
      updateData.type &&
      !["bug", "issue", "idea"].includes(updateData.type)
    ) {
      return NextResponse.json(
        { error: "Type must be 'bug', 'issue', or 'idea'" },
        { status: 400 },
      );
    }

    if (
      updateData.status &&
      !["open", "inProgress", "resolved"].includes(updateData.status)
    ) {
      return NextResponse.json(
        { error: "Status must be 'open', 'inProgress', or 'resolved'" },
        { status: 400 },
      );
    }

    const lab = await Lab.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lab) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Lab updated successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab update failed:", error);
    return handleError(error);
  }
}
