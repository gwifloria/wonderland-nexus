// DELETE /api/lab - 清空所有 labs
import { ApiResponse } from "@/types/lab";
import { NextResponse } from "next/server";
import { dbConnect } from "@wonderland/database";
import Lab from "@/app/api/models/Lab";

export async function DELETE(): Promise<
  NextResponse<ApiResponse<{ deletedCount: number }>>
> {
  try {
    await dbConnect();

    const result = await Lab.deleteMany({});

    return NextResponse.json({
      message: "All Lab documents deleted successfully",
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Lab clear failed:", error);
    return NextResponse.json(
      { error: "Failed to clear labs" },
      { status: 500 },
    );
  }
}
