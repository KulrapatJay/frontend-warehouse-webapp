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
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  const requiredRoleRoute = Object.keys(roleBasedRoutes).find((route) =>
    pathname.startsWith(route)
  );
  
  if (requiredRoleRoute) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined!");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    const payload = await verifyToken(token, secret);
    const userRole = payload?.role as string;
    
    if (!userRole || !roleBasedRoutes[requiredRoleRoute].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  const secret = process.env.JWT_SECRET;
  if (secret) {
    const payload = await verifyToken(token, secret);
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};