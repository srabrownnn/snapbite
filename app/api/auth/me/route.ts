import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("snapbite_session")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Token format: tok_<userId>_<timestamp>
    const parts = sessionToken.split("_");
    const userId = parts[1];

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = ServerStore.getUserById(userId) || ServerStore.getUsers()[0];
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const restaurant = ServerStore.getRestaurant(user.restaurant_id);

    return NextResponse.json({
      authenticated: true,
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
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
