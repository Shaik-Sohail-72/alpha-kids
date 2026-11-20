export type MessageRole = 'user' | 'assistant' | 'system';

export interface StructuredPlan {
  empathyNote: string;
  actionPlan: string[];
  checkIn: string;
  isEscalation: boolean;
  escalationDetails?: {
    emergencyType: 'self_harm' | 'abuse' | 'medical_emergency' | 'general_crisis';
    urgentMessage: string;
    helplines: {
      region: string;
      numbers: string;
    }[];
  };
  language: 'en' | 'ur' | 'roman_ur';
  disclaimer?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  structuredPlan?: StructuredPlan;
  isEscalation?: boolean;
}

export interface ChatRequest {
  messages: {
    role: MessageRole;
    content: string;
  }[];
  apiKey?: string;
  provider?: 'openai' | 'gemini' | 'mock';
  model?: string;
}

export interface ChatResponse {
  message: string;
  structuredPlan: StructuredPlan;
  error?: string;
}
