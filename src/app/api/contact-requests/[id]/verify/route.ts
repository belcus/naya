import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactVerifySchema } from "@/lib/validation";
import { verifierCodeOtp } from "@/lib/business";
import { getCallProvider } from "@/lib/providers";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = contactVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { code, flashConfirmed } = parsed.data;

  const contactRequest = await db.contactRequest.findUnique({
    where: { id: params.id },
    include: { listing: { include: { seller: true } } },
  });
  if (!contactRequest) {
    return NextResponse.json({ ok: false, error: "Demande introuvable" }, { status: 404 });
  }

  const otp = await db.otpCode.findFirst({
    where: { phone: contactRequest.clientPhone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (flashConfirmed) {
    if (otp) await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  } else {
    const result = verifierCodeOtp(otp, code!);
    if (!result.ok) {
      if (otp) await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
    }
    await db.otpCode.update({ where: { id: otp!.id }, data: { consumedAt: new Date() } });
  }

  const updated = await db.contactRequest.update({
    where: { id: params.id },
    data: { verifiedAt: new Date(), status: "appel_initie" },
  });

  const call = await getCallProvider().initiateMaskedCall(
    contactRequest.listing.seller.phone,
    contactRequest.clientPhone
  );

  return NextResponse.json({ ok: true, contactRequest: updated, callId: call.callId });
}
