import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { dispatchSaaSEvent } from "@/lib/saas-hub";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, restaurantName, phone, slug } = body;

    if (!fullName || !email || !password || !restaurantName) {
      return NextResponse.json(
        { error: "Please provide your name, email, password, and restaurant name." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters." },
        { status: 400 }
      );
    }

    const { user, restaurant } = ServerStore.createRestaurantWithOwner({
      fullName,
      email,
      password,
      restaurantName,
      phone,
      slug,
    });

    // Notify Central SaaS Hub if webhook is configured
    dispatchSaaSEvent("tenant.created", {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_slug: restaurant.slug,
      owner_id: user.id,
      owner_name: user.full_name,
      owner_email: user.email,
      phone: user.phone,
      created_at: restaurant.created_at,
    });

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
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("snapbite_session", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create restaurant account." },
      { status: 400 }
    );
  }
}
