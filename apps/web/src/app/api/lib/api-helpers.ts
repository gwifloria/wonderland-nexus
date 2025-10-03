// 4. API 错误处理工具 lib/api-helpers.ts
import { ApiResponse } from "@/types/lab";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export function handleError(error: any): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return NextResponse.json(
      { error: "数据验证失败", details: errors },
      { status: 400 },
    );
  }

  if (error.name === "CastError") {
    return NextResponse.json({ error: "Invalid lab ID" }, { status: 400 });
  }

  if (error.code === 11000) {
    return NextResponse.json({ error: "数据重复" }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Failed to process request" },
    { status: 500 },
  );
}

export function validateObjectId(id: string): NextResponse<ApiResponse> | null {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid lab ID" }, { status: 400 });
  }
  return null;
}
