import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/token";

// Proxy hanya memeriksa keberadaan session. Pemeriksaan role terbaru tetap
// dilakukan di Server Component/API melalui database, bukan klaim role di JWT.
export async function proxy(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session?.userId) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
