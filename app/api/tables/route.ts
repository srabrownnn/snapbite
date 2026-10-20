import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token) {
    const table = ServerStore.getTableByToken(token);
    if (table) {
      return NextResponse.json({ success: true, table }, { status: 200 });
    }
    return NextResponse.json({ error: "Table not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const restaurantId = req.nextUrl.searchParams.get("restaurantId") || undefined;
  const tables = ServerStore.getTables(restaurantId);
  return NextResponse.json({ success: true, tables }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if bulk sync
    if (Array.isArray(body.tables)) {
      const synced = ServerStore.syncTables(body.tables);
      return NextResponse.json({ success: true, tables: synced }, { status: 200 });
    }

    const {
      restaurant_id,
      restaurantId,
      table_number,
      tableNumber,
      capacity,
      qr_token,
      qrToken,
      id,
      status,
      created_at,
    } = body;

    const targetRestId = restaurant_id || restaurantId;
    const targetTableNum = table_number || tableNumber;

    if (!targetRestId || !targetTableNum) {
      return NextResponse.json(
        { error: "Missing restaurant_id or table_number" },
        { status: 400 }
      );
    }

    const table = ServerStore.addTable({
      id,
      restaurant_id: targetRestId,
      table_number: targetTableNum,
      capacity: Number(capacity) || 4,
      qr_token: qr_token || qrToken,
      status: status || "available",
      created_at,
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, capacity, table_number, qr_token } = body;
    if (!id) return NextResponse.json({ error: "Missing table id" }, { status: 400 });

    const updated = ServerStore.updateTable(id, {
      ...(status ? { status } : {}),
      ...(capacity !== undefined ? { capacity: Number(capacity) } : {}),
      ...(table_number ? { table_number } : {}),
      ...(qr_token ? { qr_token } : {}),
    });

    return NextResponse.json({ success: true, table: updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing table id" }, { status: 400 });

    ServerStore.deleteTable(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}
