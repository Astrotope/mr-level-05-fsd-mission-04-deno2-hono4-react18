import { assert, assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { Hono } from "hono";
import { chat } from "../src/routes/chat.ts";
import { chatService, type ChatMessage } from "../src/services/chat.service.ts";

// Configuration
const RATE_LIMIT_DELAY = 5000; // 15 requests per minute limit

const testApp = new Hono();
testApp.route("/chat", chat);

// Unit Tests

// API Validation Tests
Deno.test("Chat API - /v1/start - should accept empty message", async () => {
  const req = new Request("http://localhost/chat/v1/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const res = await testApp.fetch(req);
  assertEquals(res.status, 200);
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

// Integration Tests with Gemini

// Opt-in Tests
Deno.test({
  name: "Chat API - Positive opt-in should continue conversation",
  async fn() {
    // Start chat with positive opt-in
    const startReq = new Request("http://localhost/chat/v1/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Yes, I would like help choosing insurance"
      }),
    });

    const startRes = await testApp.fetch(startReq);
    const startData = await startRes.json();

    assertEquals(startRes.status, 200);
    assertExists(startData.response);
    assertEquals(typeof startData.response, "string");
    // Response should ask about vehicle type since user opted in
    assert(startData.response.toLowerCase().includes("vehicle") || 
           startData.response.toLowerCase().includes("car") || 
           startData.response.toLowerCase().includes("truck"));
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Chat API - Negative opt-in should end conversation",
  async fn() {
    const startReq = new Request("http://localhost/chat/v1/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "No thanks, not interested right now"
      }),
    });

    const startRes = await testApp.fetch(startReq);
    const startData = await startRes.json();

    assertEquals(startRes.status, 200);
    assertExists(startData.response);
    assertEquals(typeof startData.response, "string");
    // Response should be a farewell message
    assert(startData.response.toLowerCase().includes("thank you") && 
           startData.response.toLowerCase().includes("bye"));
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Chat API - Ambiguous response should be treated as non-opt-in",
  async fn() {
    const startReq = new Request("http://localhost/chat/v1/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Not sure about this yet"
      }),
    });

    const startRes = await testApp.fetch(startReq);
    const startData = await startRes.json();

    assertEquals(startRes.status, 200);
    assertExists(startData.response);
    assertEquals(typeof startData.response, "string");
    // Response should be a farewell message since ambiguous is treated as non-opt-in
    assert(startData.response.toLowerCase().includes("thank you") && 
           startData.response.toLowerCase().includes("bye"));
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Chat API - Should continue conversation after opt-in",
  async fn() {
    // First message (opt-in)
    const startReq = new Request("http://localhost/chat/v1/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Yes, please help me"
      }),
    });

    const startRes = await testApp.fetch(startReq);
    const startData = await startRes.json();
    
    assertEquals(startRes.status, 200);
    assertExists(startData.history);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));

    // Continue conversation
    const continueReq = new Request("http://localhost/chat/v1/continue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "I have a truck",
        history: startData.history
      }),
    });

    const continueRes = await testApp.fetch(continueReq);
    const continueData = await continueRes.json();

    assertEquals(continueRes.status, 200);
    assertExists(continueData.response);
    assertEquals(typeof continueData.response, "string");
    // Response should be about truck insurance
    assert(continueData.response.toLowerCase().includes("3rdp") || 
           continueData.response.toLowerCase().includes("third party"));
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Helper function to simulate a conversation
async function simulateConversation(messages: ChatMessage[]): Promise<ChatMessage[]> {
  const history: ChatMessage[] = [];
  for (const msg of messages) {
    const result = await chatService.continueChat(msg.parts, history);
    history.push(msg);
    if (result.response) {
      history.push({ role: 'model', parts: result.response });
    }
    // Add delay between requests (15 requests per minute limit)
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  }
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
  return history;
}

// Test cases for each decision tree scenario
Deno.test({
  name: "Integration - Truck Scenario [3RDP]",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "Yes, it's a Ford F-150 truck" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    assertEquals(result.hasTruck, true);
    assertEquals(result.policyRecommendations, ["3RDP"]);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Integration - Racing Car Scenario [3RDP]",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "No, it's not a truck" },
      { role: "user" as const, parts: "Yes, it's a racing car I use for competitions" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    assertEquals(result.hasRacingCar, true);
    assertEquals(result.policyRecommendations, ["3RDP"]);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Integration - Regular Car Over 10 Years [MBI, 3RDP]",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "No, it's not a truck" },
      { role: "user" as const, parts: "No, it's just a regular car" },
      { role: "user" as const, parts: "It's a 2010 model, about 14 years old" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    assertEquals(result.hasOldCar, true);
    assertEquals(result.policyRecommendations.sort(), ["MBI", "3RDP"].sort());
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Integration - Regular Car Under 10 Years [MBI, CCI]",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "No, it's not a truck" },
      { role: "user" as const, parts: "No, it's just a regular car" },
      { role: "user" as const, parts: "It's a 2020 model, about 4 years old" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    assertEquals(result.hasOldCar, false);
    assertEquals(result.policyRecommendations.sort(), ["MBI", "CCI"].sort());
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "Integration - Brand New Car [MBI, CCI]",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "No, it's not a truck" },
      { role: "user" as const, parts: "No, it's just a regular car" },
      { role: "user" as const, parts: "It's brand new, just got it last month" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    assertEquals(result.hasOldCar, false);
    assertEquals(result.policyRecommendations.sort(), ["MBI", "CCI"].sort());
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Test recommendation message format
Deno.test({
  name: "Integration - Recommendation Message Format",
  async fn() {
    const conversation = await simulateConversation([
      { role: "user" as const, parts: "Hi, I need insurance advice" },
      { role: "user" as const, parts: "No, it's not a truck" },
      { role: "user" as const, parts: "No, it's just a regular car" },
      { role: "user" as const, parts: "It's a 2020 model, about 4 years old" }
    ]);

    const result = await chatService.analyzeConversation(conversation);
    const recommendation = await chatService.generateRecommendation(result);

    assertExists(recommendation);
    assertEquals(typeof recommendation, "string");
    assertEquals(recommendation.includes("MBI") && recommendation.includes("CCI"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
