#!/usr/bin/env node
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.resolve("public/images");
const OUT_DIR = SRC_DIR; // 直接在原目录旁生成 .avif / .webp

const exts = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!exts.has(ext)) continue;
      await convert(p);
    }
  }
}

async function convert(file) {
  const base = file.slice(0, file.lastIndexOf("."));
  const avifOut = `${base}.avif`;
  const webpOut = `${base}.webp`;

  const input = sharp(file);

  // 优化质量设置以获得更好的压缩比
  await input
    .clone()
    .avif({ quality: 40, effort: 6 }) // 降低质量，提高压缩效率
    .toFile(avifOut)
    .catch(() => null);

  await input
    .clone()
    .webp({ quality: 60 }) // 降低 WebP 质量
    .toFile(webpOut)
    .catch(() => null);

  // 可选：为 JPG/PNG 重写元数据/优化（保持原始作为最终兜底）
  // await input.jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.opt.jpg`)
}

await mkdir(OUT_DIR, { recursive: true });
await walk(SRC_DIR);
console.log("✅ AVIF/WebP 生成完成");
