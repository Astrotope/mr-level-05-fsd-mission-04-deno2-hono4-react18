import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

interface ChatResponse {
  response: string;
  messageType?: 'greeting' | 'question' | 'recommendation' | 'farewell';
  history: ChatMessage[];
}

interface RecommendationResponse {
  recommendations: string;
  history: ChatMessage[];
}

export const chatApi = {
  startChat: async (message: string): Promise<ChatResponse> => {
    console.log('API startChat called with:', message);
    const response = await api.post('/chat/v1/start', { message });
    console.log('API startChat response:', response.data);
    return response.data;
  },

  continueChat: async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
    console.log('API continueChat called with:', { message, history });
    const response = await api.post('/chat/v1/continue', { message, history });
    console.log('API continueChat response:', response.data);
    return response.data;
  },

  getRecommendations: async (context: string, history: ChatMessage[] = []): Promise<RecommendationResponse> => {
    console.log('API getRecommendations called with:', { context, history });
    const response = await api.post('/chat/v1/recommend', { context, history });
    console.log('API getRecommendations response:', response.data);
    return response.data;
  },
};
