import { NextRequest, NextResponse } from "next/server";
import { ServerStore } from "@/lib/server-store";
import { BkashGateway } from "@/lib/bkash/pgw";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const paymentID = req.nextUrl.searchParams.get("paymentID");
    const status = req.nextUrl.searchParams.get("status");
    const orderId = req.nextUrl.searchParams.get("orderId");
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");

    const origin = req.nextUrl.origin || "http://localhost:3000";

    if (!orderId) {
      return NextResponse.redirect(`${origin}/`);
    }

    const order = ServerStore.getOrderById(orderId);
    const restaurant = ServerStore.getRestaurant(restaurantId || order?.restaurant_id);
    const table = order?.table_id ? ServerStore.getTableById(order.table_id) : undefined;
    const tableToken = table?.qr_token || "tbl_tok_01_snap";
    const redirectBase = `${origin}/r/${restaurant.slug}/t/${tableToken}`;

    if (status === "cancel" || status === "failure") {
      return NextResponse.redirect(`${redirectBase}?orderId=${orderId}&payment=failed`);
    }

    if (paymentID) {
      const config = {
        username: restaurant.bkash_username,
        password: restaurant.bkash_password,
        app_key: restaurant.bkash_app_key,
        app_secret: restaurant.bkash_app_secret,
        mode: restaurant.bkash_mode || "sandbox",
      };

      const execResult = await BkashGateway.executePayment(config, paymentID);
      if (execResult.trxID && order) {
        order.payment_status = "paid";
        order.payment_method = "bkash";
        order.bkash_trx_id = execResult.trxID;
        order.bkash_payment_id = paymentID;
        ServerStore.updateOrderPayment(order.id, "paid", "bkash");

        return NextResponse.redirect(
          `${redirectBase}?orderId=${orderId}&payment=success&trxID=${execResult.trxID}`
        );
      }
    }

    return NextResponse.redirect(`${redirectBase}?orderId=${orderId}&payment=verified`);
  } catch (error: any) {
    console.error("bKash callback error:", error);
    return NextResponse.redirect(`${req.nextUrl.origin || ""}/?error=payment_failed`);
  }
}
