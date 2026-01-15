import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // ===== 1️⃣ 推断文件扩展名 =====
    const mime = file.type || "";
    let ext = "dat";
    if (mime.includes("webm")) ext = "webm";
    else if (mime.includes("wav")) ext = "wav";
    else if (mime.includes("mp3")) ext = "mp3";
    else if (mime.includes("ogg")) ext = "ogg";

    // ===== 2️⃣ 生成文件名 =====
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // ===== 3️⃣ 确保目录存在 =====
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ===== 4️⃣ 写入文件 =====
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // ===== 5️⃣ 构造公网 URL（ECS 环境用） =====
    const baseUrl =
      process.env.PUBLIC_BASE_URL || "http://localhost:3000";

    const audioUrl = `${baseUrl}/uploads/${filename}`;

    return NextResponse.json({
      audioUrl,
      format: ext,
      mime,
      size: buffer.length,
    });
  } catch (err) {
    console.error("ASR upload error:", err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
