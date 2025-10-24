import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/login"];

const roleBasedRoutes: Record<string, string[]> = {
  "/user_management": ["admin"],
  "/product_management": ["manager"],
  "/staff": ["staff", "manager"],
};

async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 1. อนุญาตให้เข้าถึง Public Routes ได้เสมอ
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  // 2. ตรวจสอบว่ามี Token หรือไม่ (เหมือนเดิม)
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // 3. ตรวจสอบ Role สำหรับหน้าที่ต้องการป้องกัน
  const requiredRoles = Object.keys(roleBasedRoutes).find((route) =>
    pathname.startsWith(route)
  );
  if (requiredRoles) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined!");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = await verifyToken(token, secret);
    const userRole = payload?.role as string;
    // ถ้าไม่มี payload (token ไม่ถูก) หรือ role ไม่ตรงกับที่กำหนด
    if (!userRole || !roleBasedRoutes[requiredRoles].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
