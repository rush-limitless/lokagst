import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File;
  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}.${ext}`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);

  await writeFile(filepath, buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
