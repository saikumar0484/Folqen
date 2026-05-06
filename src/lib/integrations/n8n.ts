import { getEnv } from "@/lib/env";

export type N8nTestResult = {
  status: "not_connected" | "configured" | "live" | "failed";
  message: string;
};

export async function testN8nWebhook(): Promise<N8nTestResult> {
  const env = getEnv();

  if (!env.N8N_WEBHOOK_URL) {
    return {
      status: "not_connected",
      message: "N8N_WEBHOOK_URL is not configured.",
    };
  }

  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.N8N_WEBHOOK_SECRET ? { "x-folqen-secret": env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        source: "folqen",
        event: "connection_test",
        mode: "health_check",
        publicPublishing: "disabled",
        paidTools: "disabled",
      }),
    });

    if (!response.ok) {
      return {
        status: "failed",
        message: `n8n webhook responded with HTTP ${response.status}.`,
      };
    }

    return {
      status: "live",
      message: "n8n webhook accepted the Folqen connection test.",
    };
  } catch {
    return {
      status: "failed",
      message: "n8n webhook could not be reached from this runtime.",
    };
  }
}
