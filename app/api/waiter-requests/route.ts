import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { WaiterRequestType } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId") || undefined;
  const requests = ServerStore.getWaiterRequests(restaurantId);
  return NextResponse.json({ success: true, requests }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, tableId, type } = body;

    if (!restaurantId || !tableId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = ServerStore.createWaiterRequest(
      restaurantId,
      tableId,
      type as WaiterRequestType
    );

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const resolved = ServerStore.resolveWaiterRequest(id);
    return NextResponse.json({ success: true, request: resolved }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to resolve request" }, { status: 500 });
  }
}
