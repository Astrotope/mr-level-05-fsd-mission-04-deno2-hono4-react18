import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.ts";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chat: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: "You are a professional AI assistant. Please engage in natural conversation and provide direct, helpful responses without any formatting or markdown. Be polite and professional, but friendly. Don't refer to the user as 'bob' - just respond to their questions and messages naturally.",
        },
        {
          role: "model",
          parts: "I understand. I'll be professional, friendly, and direct in my responses, focusing on being helpful while maintaining natural conversation. I'll avoid any special formatting and respond in a straightforward manner.",
        }
      ],
    });
  }

  private extractAssistantResponse(text: string): string {
    // If the text contains markdown or formatting, try to clean it
    if (text.includes('**')) {
      const matches = text.match(/\*\*.*?\*\*.*?(?=\n|$)/g);
      if (matches && matches.length > 0) {
        // Get the content after the last heading/bold text
        const lastMatch = matches[matches.length - 1];
        return lastMatch.split('**').pop()?.trim() || text;
      }
    }
    return text; // Return as is if no formatting detected
  }

  async startChat(message: string) {
    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = await response.text();
      return { response: this.extractAssistantResponse(text) };
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  async continueChat(history: ChatMessage[], message: string) {
    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = await response.text();
      return { response: this.extractAssistantResponse(text) };
    } catch (error) {
      console.error('Error continuing chat:', error);
      throw error;
    }
  }

  async getRecommendations(context: string) {
    try {
      const prompt = `Based on the conversation below, provide 3-5 relevant recommendations or suggestions that could help continue or enhance the discussion. Make the recommendations specific and actionable.

Conversation:
${context}

Please format your response as a natural, friendly list of suggestions without any special formatting or markdown.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return { recommendations: text };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
