import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get("restaurantId") || undefined;
  const tables = ServerStore.getTables(restaurantId);
  return NextResponse.json({ success: true, tables }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, capacity, table_number } = body;
    if (!id) return NextResponse.json({ error: "Missing table id" }, { status: 400 });

    const updated = ServerStore.updateTable(id, {
      ...(status ? { status } : {}),
      ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
      ...(table_number ? { table_number } : {}),
    });

    return NextResponse.json({ success: true, table: updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
