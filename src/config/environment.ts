
// Environment configuration that works in browser context
// These values are injected by Vite during build time

export const config = {
  // N8N webhook URLs
  n8nWebhooks: {
    command: "https://n8n.tungnguyenai.com/webhook/command",
    routing: "https://n8n.tungnguyenai.com/webhook/route", 
    activity: "https://n8n.tungnguyenai.com/webhook/activity",
  },
  // Flag to enable/disable mock mode when no webhooks are configured
  useMockMode: false, // Setting to false since we have configured webhooks
  // Backend API URLs
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "",
  }
};

// Log environment configuration on startup (only in development)
if (import.meta.env.DEV) {
  console.log("📋 Environment configuration:", {
    n8nWebhooks: {
      command: config.n8nWebhooks.command || "(not set)",
      routing: config.n8nWebhooks.routing || "(not set)",
      activity: config.n8nWebhooks.activity || "(not set)",
    },
    useMockMode: config.useMockMode,
    api: {
      baseUrl: config.api.baseUrl || "(not set)",
    }
  });
  
  if (config.useMockMode) {
    console.log("⚠️ Running in MOCK MODE - no real backend connections will be made");
    console.log("💡 To connect to real backends, configure the webhook URLs in your .env file");
  } else {
    console.log("✅ Webhook URLs configured - attempting real backend connections");
  }
}
