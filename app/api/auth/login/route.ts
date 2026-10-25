import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const user = ServerStore.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 401 }
      );
    }

    if (user.password && user.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const restaurant = ServerStore.getRestaurant(user.restaurant_id);
    const token = `tok_${user.id}_${Date.now()}`;

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          restaurant_id: user.restaurant_id,
          role: user.role,
          created_at: user.created_at,
        },
        restaurant,
        token,
      },
      { status: 200 }
    );

    response.cookies.set("snapbite_session", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during authentication." },
      { status: 500 }
    );
  }
}
