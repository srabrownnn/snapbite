import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPER_ADMIN_SECRET =
  process.env.SUPER_ADMIN_KEY ||
  process.env.SAAS_MANAGEMENT_API_KEY ||
  "snapbite_super_admin_2026";

/**
 * GET /api/auth/super-admin
 * Checks if current session has super-admin privileges
 */
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("snapbite_super_admin_session");
  const isAuthenticated = Boolean(cookie?.value && cookie.value.startsWith("sa_valid_"));

  return NextResponse.json({ authenticated: isAuthenticated });
}

/**
 * POST /api/auth/super-admin
 * Verifies super-admin master key and sets session cookie
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey } = body;

    if (!secretKey || typeof secretKey !== "string") {
      return NextResponse.json({ error: "Please enter the Super Admin Security Key." }, { status: 400 });
    }

    if (secretKey.trim() !== SUPER_ADMIN_SECRET) {
      return NextResponse.json({ error: "Access Denied: Invalid Super Admin Security Key." }, { status: 401 });
    }

    const sessionVal = `sa_valid_${Date.now()}`;
    const response = NextResponse.json({ success: true, message: "Super Admin authorized." });

    response.cookies.set("snapbite_super_admin_session", sessionVal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600, // 7 days
      path: "/",
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/super-admin
 * Logs out of Super Admin
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.delete("snapbite_super_admin_session");
  return response;
}
