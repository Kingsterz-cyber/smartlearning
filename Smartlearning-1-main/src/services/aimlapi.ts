// OpenAI-compatible AIMLAPI client (fetch-based, no external SDK)
// Reads credentials from Vite env variables. Do NOT hardcode secrets.

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatOptions {
  model?: string; // default: "openai/gpt-4o"
  temperature?: number; // default: 0.7
  top_p?: number; // default: 0.7
  frequency_penalty?: number; // default: 1
  max_tokens?: number; // default: 1536
  top_k?: number; // default: 50
}

export interface ChatCompletionResponse {
  content: string;
  raw?: any;
}

const DEFAULT_MODEL = 'openai/gpt-4o';

function getBaseUrl() {
  const base = import.meta.env.VITE_AIMLAPI_BASE_URL?.toString().trim();
  return base || 'https://api.aimlapi.com/v1';
}

function getApiKey() {
  const key = import.meta.env.VITE_AIMLAPI_API_KEY?.toString().trim();
  if (!key) {
    console.warn('[AIMLAPI] Missing VITE_AIMLAPI_API_KEY. Set it in your .env.local');
  }
  return key || '';
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<ChatCompletionResponse> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();

  const body = {
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    top_p: opts.top_p ?? 0.7,
    frequency_penalty: opts.frequency_penalty ?? 1,
    max_tokens: opts.max_tokens ?? 1536,
    top_k: opts.top_k ?? 50,
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[AIMLAPI] ${res.status} ${res.statusText} — ${text}`);
  }

  const data = await res.json();
  // OpenAI-compatible shape
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  return { content, raw: data };
}

// Convenience helper to build a context-aware prompt
export function buildContextPrompt(params: {
  role: 'student' | 'teacher';
  grade?: string | number;
  subject?: string;
  topic?: string;
  currentContent?: string;
  instruction: string; // e.g., "Generate 5 MCQs on Fractions for Grade 5"
}) {
  const { role, grade, subject, topic, currentContent, instruction } = params;
  const parts: string[] = [];
  parts.push(`User role: ${role}`);
  if (grade !== undefined) parts.push(`Grade: ${grade}`);
  if (subject) parts.push(`Subject: ${subject}`);
  if (topic) parts.push(`Topic: ${topic}`);
  if (currentContent) parts.push(`Current content/context:\n${currentContent}`);
  parts.push(`Task: ${instruction}`);
  return parts.join('\n');
}