import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStorageProvider } from "@/lib/providers";

const EXTENSIONS_AUTORISEES = new Set(["webm", "mp3", "wav", "m4a", "ogg", "jpg", "jpeg", "png", "webp"]);

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant" }, { status: 400 });
  }

  const extGuess = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
  const ext = EXTENSIONS_AUTORISEES.has(extGuess) ? extGuess : "bin";
  if (ext === "bin") {
    return NextResponse.json({ ok: false, error: "Type de fichier non supporté" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Fichier trop volumineux (max 15 Mo)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;
  const url = await getStorageProvider().save(buffer, filename);

  return NextResponse.json({ ok: true, url });
}
