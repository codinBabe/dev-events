import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;

    if (!adminUsername || !adminPassword || !authSecret) {
      console.error(
        "Missing environment variables: ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET"
      );
      return NextResponse.json(
        { success: false, message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Use timing-safe comparison to prevent timing attacks
    const isUsernameValid = crypto.timingSafeEqual(
      Buffer.from(username),
      Buffer.from(adminUsername)
    );

    const isPasswordValid = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(adminPassword)
    );

    if (!isUsernameValid || !isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create signed token compatible with middleware
    const timestamp = Date.now().toString();
    const payload = `${timestamp}.${username}`;

    const signature = crypto
      .createHmac("sha256", authSecret)
      .update(payload)
      .digest("hex");

    const token = `${timestamp}.${username}.${signature}`;

    const res = NextResponse.json(
      {
        success: true,
        message: "Login successful",
      },
      { status: 200 }
    );

    // Strong secure cookie settings
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch (error) {
    console.error(
      "AUTH LOGIN ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
