import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
}

interface RecommendationResponse {
  recommendations: string;
}

export const chatApi = {
  startChat: async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/chat/v1/start', { message });
    return response.data;
  },

  continueChat: async (history: ChatMessage[], message: string): Promise<ChatResponse> => {
    const response = await api.post('/chat/v1/continue', { history, message });
    return response.data;
  },

  getRecommendations: async (context: string): Promise<RecommendationResponse> => {
    const response = await api.post('/chat/v1/recommend', { context });
    return response.data;
  },
};
