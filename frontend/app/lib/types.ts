// app/lib/types.ts

// Request model matching the backend CreateAgentRequest
export interface CreateAgentRequest {
    platform: 'vapi' | 'retell';
    agent_name?: string;
    voice: string;  // Standardized voice (e.g., "emma", "aria", "guy")
    prompt?: string;
    language?: string;  // Standardized language (e.g., "en", "es")
    voicemail_message?: string;
    retell_llm_config?: Record<string, any>;  // Optional Retell LLM config
  }
  
  // Response model matching the backend CreateAgentResponse
  export interface CreateAgentResponse {
    agent_id: string;
    agent_name?: string;
    voice: string;
    language: string;
  }
  
  // Voice mapping for display in UI
  export const VOICE_OPTIONS = [
    { id: 'emma', label: 'Emma (Female)' },
    { id: 'aria', label: 'Aria (Female)' },
    { id: 'guy', label: 'Guy (Male)' },
  ];
  
  // Language mapping for display in UI
  export const LANGUAGE_OPTIONS = [
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
    { id: 'it', label: 'Italian' },
    { id: 'ja', label: 'Japanese' },
    { id: 'ko', label: 'Korean' },
    { id: 'pt', label: 'Portuguese' },
    { id: 'zh', label: 'Chinese' },
    { id: 'ru', label: 'Russian' },
  ];
  
  // Platform options
  export const PLATFORM_OPTIONS = [
    { id: 'vapi', label: 'Vapi AI' },
    { id: 'retell', label: 'Retell AI' },
  ];