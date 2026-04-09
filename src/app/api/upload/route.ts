import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("photo") as File;
  if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Type de fichier non autorisé (JPG, PNG, WebP, PDF)" }, { status: 400 });

  try {
    // Use Vercel Blob in production, local fallback in dev
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`immogest/${Date.now()}-${file.name}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    // Local fallback for development
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public/uploads");
    await mkdir(dir, { recursive: true });
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(dir, filename), Buffer.from(bytes));
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e: any) {
    console.error("[UPLOAD_ERROR]", e);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
