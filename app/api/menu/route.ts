import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId") || undefined;
  const items = ServerStore.getMenuItems(restaurantId);
  const categories = ServerStore.getCategories(restaurantId);
  const addons = ServerStore.getAddons(restaurantId);
  return NextResponse.json({ success: true, items, categories, addons }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_available, is_featured, price, name } = body;
    if (!id) return NextResponse.json({ error: "Missing item id" }, { status: 400 });

    const updated = ServerStore.updateMenuItem(id, {
      ...(is_available !== undefined ? { is_available } : {}),
      ...(is_featured !== undefined ? { is_featured } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(name ? { name } : {}),
    });

    return NextResponse.json({ success: true, item: updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem = ServerStore.addMenuItem(body);
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to add menu item" }, { status: 500 });
  }
}
