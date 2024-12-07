import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { Hono } from "hono";
import { chat } from "../src/routes/chat.ts";

const testApp = new Hono();
testApp.route("/chat", chat);

Deno.test("Chat API - /v1/start - should require message", async () => {
  const req = new Request("http://localhost/chat/v1/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await testApp.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, "Message is required");
});

Deno.test("Chat API - /v1/continue - should require history and message", async () => {
  const req = new Request("http://localhost/chat/v1/continue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await testApp.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, "History and message are required");
});

Deno.test("Chat API - /v1/recommend - should require context", async () => {
  const req = new Request("http://localhost/chat/v1/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await testApp.fetch(req);
  const data = await res.json();

  assertEquals(res.status, 400);
  assertEquals(data.error, "Context is required");
});
