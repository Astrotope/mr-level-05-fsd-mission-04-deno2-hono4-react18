import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config/env.ts";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const schema = {
  description: "List of recipes",
  type: "array",
  items: {
    type: "object",
    properties: {
      recipeName: {
        type: "string",
        description: "Name of the recipe",
        nullable: false,
      },
    },
    required: ["recipeName"],
  },
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

const test = async () => {
  try {
    const result = await model.generateContent(
      "List a few popular cookie recipes.",
    );
    console.log(await result.response.text());
  } catch (error) {
    console.error('Error:', error);
  }
};

test();
