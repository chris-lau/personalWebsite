export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model: string;
}

export interface ChatModelInfo {
  id: string;
  label: string;
  provider: string;
}

export interface ChatModelsResponse {
  models: ChatModelInfo[];
  defaultModel: string;
}
