import { NextResponse } from "next/server";
import { UniversalDB } from "@/lib/db/universal-adapter";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/saas/status
 * Public / lightweight health check endpoint for the Central SaaS Hub
 */
export async function GET() {
  const startTime = Date.now();
  const uptime = Math.floor(process.uptime ? process.uptime() : 0);
  const dbHealth = await UniversalDB.getHealth();

  return NextResponse.json({
    product: "SnapBite QR Restaurant OS",
    slug: "snapbite",
    status: dbHealth.connected ? "operational" : "degraded",
    version: "1.0.0",
    database: {
      provider: dbHealth.provider,
      connected: dbHealth.connected,
      details: dbHealth.details,
    },
    uptime_seconds: uptime,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    response_time_ms: Date.now() - startTime,
  });
}
