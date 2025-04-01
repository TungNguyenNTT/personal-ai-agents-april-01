// Environment configuration that works in browser context
// These values are injected by Vite during build time

export const config = {
  // N8N webhook URL - single endpoint for all agent interactions
  n8nWebhook: "https://n8n.tungnguyenai.com/webhook/agent",
  
  // Flag to enable/disable mock mode when no webhook is configured
  useMockMode: false, // Setting to false since we have configured webhook
  
  // Backend API URLs
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "",
  }
};

// Log environment configuration on startup (only in development)
if (import.meta.env.DEV) {
  console.log("📋 Environment configuration:", {
    n8nWebhook: config.n8nWebhook || "(not set)",
    useMockMode: config.useMockMode,
    api: {
      baseUrl: config.api.baseUrl || "(not set)",
    }
  });
  
  if (config.useMockMode) {
    console.log("⚠️ Running in MOCK MODE - no real backend connections will be made");
    console.log("💡 To connect to real backends, configure the webhook URL in your .env file");
  } else {
    console.log("✅ Webhook URL configured - attempting real backend connections");
  }
}
