import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Protect all admin routes
  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    const authSecret = process.env.AUTH_SECRET || "";

    if (!token || !authSecret) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const [timestamp, username, signature] = parts;

    // Validate signature
    const payload = `${timestamp}.${username}`;
    const expectedSignature = crypto
      .createHmac("sha256", authSecret)
      .update(payload)
      .digest("hex");

    try {
      const expectedBuffer = Buffer.from(expectedSignature, "hex");
      const signatureBuffer = Buffer.from(signature, "hex");
      
      if (
        expectedBuffer.length !== signatureBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
      ) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Check expiration
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const maxAge = 24 * 60 * 60 * 1000;

    if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > maxAge) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    //Auth successful → allow access
    return NextResponse.next();
  }

  // No admin route → allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
