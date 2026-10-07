import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySchema } from "@/lib/validation";
import { verifierCodeOtp } from "@/lib/business";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, code, flashConfirmed } = parsed.data;

  const user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Compte introuvable" }, { status: 404 });
  }

  const otp = await db.otpCode.findFirst({
    where: { userId: user.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (flashConfirmed) {
    // Simulation de l'appel flash : la réception de l'appel suffit à valider,
    // aucune saisie de code nécessaire (voir lib/providers — CallProvider "dev").
    if (otp) await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  } else {
    const result = verifierCodeOtp(otp, code!);
    if (!result.ok) {
      if (otp) await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
    }
    await db.otpCode.update({ where: { id: otp!.id }, data: { consumedAt: new Date() } });
  }

  const verifiedUser = await db.user.update({
    where: { id: user.id },
    data: { verifiedAt: user.verifiedAt ?? new Date() },
  });

  const token = await createSession(verifiedUser.id);
  setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: { id: verifiedUser.id, fullName: verifiedUser.fullName, phone: verifiedUser.phone, plan: verifiedUser.plan },
  });
}
