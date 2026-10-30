import { NextRequest, NextResponse } from "next/server";
import { validateSaaSRequest, getSaaSMetrics } from "@/lib/saas-hub";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/saas/metrics
 * Secure authenticated endpoint returning aggregated SaaS statistics, tenant counts, active users, and financial summaries.
 * Protected by header 'x-saas-api-key' or 'Authorization: Bearer <key>'.
 */
export async function GET(req: NextRequest) {
  const auth = validateSaaSRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        error: auth.error || "Unauthorized",
        hint: "Provide valid API key in 'x-saas-api-key' or 'Authorization: Bearer <key>' header.",
      },
      { status: 401 }
    );
  }

  try {
    const metrics = getSaaSMetrics();
    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[SaaS Metrics Endpoint Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate SaaS metrics", details: error.message },
      { status: 500 }
    );
  }
}
