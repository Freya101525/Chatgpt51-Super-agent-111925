
export interface AgentConfig {
  name: string;
  description: string;
  system_prompt: string;
  user_prompt: string;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
}

export interface AgentOutput {
  input: string;
  output: string;
  time: number;
  tokens: number;
  provider: string;
  model: string;
}

export interface RunMetric {
  agent: string;
  latency: number;
  tokens: number;
  provider: string;
  timestamp: string;
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  bg_light: string;
  bg_dark: string;
  icon: string;
  name: string;
}

export interface AppState {
  theme: string;
  darkMode: boolean;
  language: 'zh_TW' | 'en';
  ocrText: string;
  agents: AgentConfig[];
  outputs: AgentOutput[];
  metrics: RunMetric[];
  reviewNotes: string;
  apiKeys: {
    openai: string;
    gemini: string;
    grok: string;
    anthropic: string;
  };
}
