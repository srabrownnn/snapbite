import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { BkashGateway } from "@/lib/bkash/pgw";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentID, orderId, restaurantId } = body;

    if (!paymentID || !orderId) {
      return NextResponse.json(
        { error: "Missing paymentID or orderId." },
        { status: 400 }
      );
    }

    const order = ServerStore.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const restaurant = ServerStore.getRestaurant(restaurantId || order.restaurant_id);
    const config = {
      username: restaurant.bkash_username,
      password: restaurant.bkash_password,
      app_key: restaurant.bkash_app_key,
      app_secret: restaurant.bkash_app_secret,
      mode: restaurant.bkash_mode || "sandbox",
    };

    const execResponse = await BkashGateway.executePayment(config, paymentID);

    if (execResponse.statusCode === "0000" && execResponse.trxID) {
      // Mark order as paid
      order.payment_status = "paid";
      order.payment_method = "bkash";
      order.bkash_trx_id = execResponse.trxID;
      order.bkash_payment_id = paymentID;
      order.updated_at = new Date().toISOString();

      // Persist in server store
      ServerStore.updateOrderPayment(order.id, "paid", "bkash");

      return NextResponse.json({
        success: true,
        order,
        trxID: execResponse.trxID,
        status: "Completed",
      });
    } else {
      return NextResponse.json(
        {
          error: execResponse.statusMessage || "bKash payment verification failed.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("bKash execute payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute bKash payment." },
      { status: 500 }
    );
  }
}
