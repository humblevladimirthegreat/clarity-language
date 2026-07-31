export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmClientConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export function loadLlmConfig(): LlmClientConfig {
  const model = (process.env.METAPHOR_ASSIGN_MODEL ?? "").trim();
  if (!model) {
    throw new Error(
      "METAPHOR_ASSIGN_MODEL is required (e.g. export METAPHOR_ASSIGN_MODEL=your-local-model)",
    );
  }
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "http://localhost:1234/v1").replace(/\/$/, "");
  const apiKey = process.env.OPENAI_API_KEY ?? "local";
  return { baseUrl, apiKey, model };
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
};

export async function chatCompletion(
  config: LlmClientConfig,
  messages: ChatMessage[],
  options: { temperature: number; maxTokens?: number },
): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("LLM returned empty content");
  }
  return content.trim();
}

/** Extract JSON object or array from model output (handles fenced code blocks). */
export function extractJsonPayload(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const firstBrace = text.search(/[{[]/);
  if (firstBrace === -1) {
    return text.trim();
  }
  return text.slice(firstBrace).trim();
}

export async function chatCompletionJson<T>(
  config: LlmClientConfig,
  messages: ChatMessage[],
  options: { temperature: number; maxTokens?: number },
  parse: (value: unknown) => T,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const content = await chatCompletion(config, messages, options);
    try {
      const payload = extractJsonPayload(content);
      return parse(JSON.parse(payload));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      messages = [
        ...messages,
        { role: "assistant", content },
        {
          role: "user",
          content:
            "Your previous response was not valid JSON matching the schema. Reply with JSON only, no markdown.",
        },
      ];
    }
  }
  throw new Error(`Failed to parse LLM JSON after retry: ${lastError?.message ?? "unknown"}`);
}
