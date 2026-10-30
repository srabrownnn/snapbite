import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/saas/status
 * Public / lightweight health check endpoint for the Central SaaS Hub
 */
export async function GET() {
  const startTime = Date.now();
  const uptime = Math.floor(process.uptime ? process.uptime() : 0);

  return NextResponse.json({
    product: "SnapBite QR Restaurant OS",
    slug: "snapbite",
    status: "operational",
    version: "1.0.0",
    uptime_seconds: uptime,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    response_time_ms: Date.now() - startTime,
  });
}
