import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

await load({ export: true });

interface Config {
  PORT: number;
  GEMINI_API_KEY: string;
  NODE_ENV: string;
}

export const config: Config = {
  PORT: Number(Deno.env.get("PORT")) || 8000,
  GEMINI_API_KEY: Deno.env.get("GEMINI_API_KEY") || "",
  NODE_ENV: Deno.env.get("NODE_ENV") || "development",
};
