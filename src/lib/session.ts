import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";
import { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "./constants";

// Auth simple par téléphone + OTP : pas de mot de passe, donc pas besoin de hachage.
// Un token de session aléatoire est stocké en base et posé en cookie httpOnly.

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID() + randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  return token;
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroyCurrentSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  clearSessionCookie();
}
