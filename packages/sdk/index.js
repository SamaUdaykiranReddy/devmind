"use strict";

const DEFAULT_API_URL = "https://api.devmind.io";

class DevMindSDK {
  constructor() {
    this.apiKey = null;
    this.service = "unknown-service";
    this.apiUrl = DEFAULT_API_URL;
    this.debug = false;
    this.initialized = false;
  }

  init({ apiKey, service, apiUrl, debug = false }) {
    if (!apiKey) {
      console.warn(
        "[DevMind] Warning: No API key provided. Get one at devmind.io",
      );
    }
    this.apiKey = apiKey;
    this.service = service || "unknown-service";
    this.apiUrl = apiUrl || process.env.DEVMIND_API_URL || DEFAULT_API_URL;
    this.debug = debug;
    this.initialized = true;

    // Auto-capture uncaught exceptions
    process.on("uncaughtException", async (error) => {
      await this.capture(error, "uncaughtException");
      process.exit(1);
    });

    // Auto-capture unhandled promise rejections
    process.on("unhandledRejection", async (reason) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      await this.capture(error, "unhandledRejection");
    });

    this._log(`✅ DevMind initialized for service: ${this.service}`);
    this._log(`📡 Sending errors to: ${this.apiUrl}`);
  }

  async capture(error, route = "manual", extra = {}) {
    if (!this.initialized) {
      console.warn("[DevMind] SDK not initialized. Call DevMind.init() first.");
      return;
    }

    try {
      const payload = {
        error: error.message || String(error),
        stack: error.stack || "",
        service: this.service,
        route: route,
        timestamp: new Date().toISOString(),
        ...extra,
      };

      this._log(`🔍 Capturing error: ${error.message}`);

      const headers = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["x-api-key"] = this.apiKey;
      }

      const response = await fetch(`${this.apiUrl}/api/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        this._log(`✅ Error analyzed. Jira: ${result.jira_key || "N/A"}`);
        return result;
      }
    } catch (err) {
      this._log(`❌ DevMind capture failed: ${err.message}`);
    }
  }

  middleware() {
    return (err, req, res, next) => {
      this.capture(err, req.path, {
        method: req.method,
        url: req.url,
      });
      next(err);
    };
  }

  wrap(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.capture(error, fn.name || "wrapped-function");
        throw error;
      }
    };
  }

  _log(message) {
    if (this.debug) {
      console.log(`[DevMind] ${message}`);
    }
  }
}

const DevMind = new DevMindSDK();
module.exports = DevMind;
module.exports.DevMind = DevMind;
module.exports.default = DevMind;
