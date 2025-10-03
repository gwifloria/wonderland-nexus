import { ThreadApi } from "@/types/letter";

export const COVERS = [
  "/images/letter-bg1.png",
  "/images/letter-bg2.png",
  "/images/letter-bg3.png",
  "/images/letter-bg4.png",
] as const;

export const STICKER_IMGS = [
  "/images/daisy-flower-single.png",
  "/images/orange-flowers.png",
  "/images/pencils.png",
] as const;

export const STICKER_POS = [
  "-left-2 bottom-3 h-9 w-9 rotate-0", // 左下
  "right-2 -top-1 h-8 w-8 rotate-[6deg]", // 右上
  "left-2 top-2 h-8 w-8 -rotate-[8deg]", // 左上
] as const;

export type ApiResp = {
  message: string;
  data: ThreadApi[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
