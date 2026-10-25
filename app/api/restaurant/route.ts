import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const slugOrId = req.nextUrl.searchParams.get("slug") || req.nextUrl.searchParams.get("id") || undefined;
    const restaurant = ServerStore.getRestaurant(slugOrId);
    return NextResponse.json({ success: true, restaurant }, { status: 200 });
  } catch (error: any) {
    console.error("GET restaurant API error:", error);
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = ServerStore.updateRestaurant(body);
    return NextResponse.json({ success: true, restaurant: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH restaurant API error:", error);
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}
