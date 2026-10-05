import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = ServerStore.getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, order }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, paymentStatus, paymentMethod } = body;

    let updated = ServerStore.getOrderById(params.id);

    if (status) {
      updated = ServerStore.updateOrderStatus(params.id, status as OrderStatus);
    }

    if (paymentStatus) {
      updated = ServerStore.updateOrderPayment(
        params.id,
        paymentStatus as PaymentStatus,
        paymentMethod as PaymentMethod
      );
    }

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH order error:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
