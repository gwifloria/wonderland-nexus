import { ApiResponse } from "@/types/lab";
import { NextRequest, NextResponse } from "next/server";
import { handleError, validateObjectId } from "../../lib/api-helpers";
import { dbConnect } from "@wonderland/database";
import Lab, { ILab } from "@/app/api/models/Lab";

// POST /api/lab/delete - 删除单个 lab
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ILab>>> {
  try {
    await dbConnect();

    const body: { id: string } = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required in request body" },
        { status: 400 },
      );
    }

    const idValidation = validateObjectId(id);
    if (idValidation) return idValidation;

    const lab = await Lab.findByIdAndDelete(id);

    if (!lab) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Lab deleted successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab deletion failed:", error);
    return handleError(error);
  }
}
