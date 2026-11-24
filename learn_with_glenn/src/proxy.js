
import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  verifySessionToken,
} from "@/lib/token";

const protectedRoutes = [
  {
    path: "/dashboard/admin",
    role: "admin",
  },
  {
    path: "/dashboard/teacher",
    role: "teacher",
  },
  {
    path: "/dashboard/student",
    role: "student",
  },
];

async function checkAccess(request) {
  const { pathname } = request.nextUrl;

  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (user.role !== matchedRoute.role) {
    const dashboardByRole = {
      admin: "/dashboard/admin",
      teacher: "/dashboard/teacher",
      student: "/dashboard/student",
    };

    return NextResponse.redirect(
      new URL(
        dashboardByRole[user.role] || "/login",
        request.url
      )
    );
  }

  return NextResponse.next();
}

// Untuk Next.js 16+
export function proxy(request) {
  return checkAccess(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
