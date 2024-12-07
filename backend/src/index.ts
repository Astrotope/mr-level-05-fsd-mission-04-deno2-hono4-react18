import { Hono } from "hono";
import { cors } from "hono/middleware";
import { config } from "./config/env.ts";
import { chat } from "./routes/chat.ts";

const app = new Hono();

// Middleware
app.use("/*", cors({
  origin: ["http://localhost:5173"], // Updated to Vite's default port
  allowMethods: ["POST", "GET", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.route("/chat", chat);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

Deno.serve({ port: config.PORT }, app.fetch);
