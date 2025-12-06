export interface UserConfig {
  email: string;
  targetTime: string;
}

export interface NewsPreferences {
  politics: number;
  economics: number;
  lifestyle: number;
  includeAiSummary: boolean;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  isStreaming?: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  statusMessage: string;
  error: string | null;
}