import { Hono } from "hono";
import { chatService } from "../services/chat.service.ts";

const chat = new Hono();

chat.post("/v1/start", async (c) => {
  try {
    const body = await c.req.json();
    const message = body.message ?? "";
    const history = body.history ?? [];

    const response = await chatService.startChat(message, history);
    return c.json(response);
  } catch (error) {
    console.error('Error in start chat endpoint:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

chat.post("/v1/continue", async (c) => {
  try {
    const { history, message } = await c.req.json();
    if (!history || !message) {
      return c.json({ error: "History and message are required" }, 400);
    }

    const response = await chatService.continueChat(message, history);
    return c.json(response);
  } catch (error) {
    console.error('Error in continue chat endpoint:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

chat.post("/v1/recommend", async (c) => {
  try {
    const { context, history = [] } = await c.req.json();
    if (!context) {
      return c.json({ error: "Context is required" }, 400);
    }

    const recommendations = await chatService.getRecommendations(context, history);
    return c.json(recommendations);
  } catch (error) {
    console.error('Error in recommendations endpoint:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { chat };
