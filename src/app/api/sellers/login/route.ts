import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { phoneSchema } from "@/lib/validation";
import { generateOtpCode, getOtpProvider } from "@/lib/providers";
import { OTP_EXPIRATION_MINUTES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = phoneSchema.safeParse(body?.phone);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Numéro invalide" }, { status: 400 });
  }
  const phone = parsed.data;

  const user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "compte_introuvable" }, { status: 404 });
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
  await db.otpCode.create({
    data: { phone, code, channel: "voice_announce", userId: user.id, expiresAt },
  });

  const provider = getOtpProvider();
  await provider.sendCode(phone, code, "voice_announce");
  await provider.sendCode(phone, code, "sms");
  await provider.triggerFlashCall(phone);

  const isDev = (process.env.OTP_PROVIDER || "dev") === "dev";
  return NextResponse.json({ ok: true, phone, devCode: isDev ? code : undefined });
}
