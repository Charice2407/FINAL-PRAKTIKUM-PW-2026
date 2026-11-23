
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET
);

const COOKIE_NAME = "lwg_session";

// Membuat token session yang berlaku selama 1 hari.
export async function createSessionToken(user) {
  return await new SignJWT({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

// Memeriksa apakah token valid dan belum kedaluwarsa.
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
