const DevMind = {
  service: "unknown-service",
  apiUrl: "http://localhost:3001",

  init({ service, apiUrl }) {
    this.service = service || "unknown-service";
    if (apiUrl) this.apiUrl = apiUrl;

    process.on("uncaughtException", async (error) => {
      await this.capture(error, "uncaughtException");
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      await this.capture(
        reason instanceof Error ? reason : new Error(String(reason)),
        "unhandledRejection",
      );
    });

    console.log(`✅ DevMind initialized for service: ${this.service}`);
  },

  async capture(error, route = "unknown") {
    try {
      const response = await fetch(`${this.apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          service: this.service,
          route: route,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(`🔍 DevMind captured: ${error.message} on ${route}`);
    } catch (err) {
      console.error("DevMind failed to send error:", err.message);
    }
  },
};

module.exports = DevMind;
