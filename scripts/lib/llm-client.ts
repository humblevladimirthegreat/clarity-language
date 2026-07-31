import { existsSync } from "node:fs";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmClientConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  requestTimeoutMs: number;
};

type ModelsListResponse = {
  data?: Array<{ id?: string }>;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
    finish_reason?: string | null;
  }>;
};

function extractMessageText(message: {
  content?: string | null;
  reasoning_content?: string | null;
}): string {
  const content = (message.content ?? "").trim();
  if (content) return content;

  const reasoning = (message.reasoning_content ?? "").trim();
  if (reasoning) {
    throw new Error(
      "LLM returned empty content but filled reasoning_content — increase LLM_REQUEST_TIMEOUT_MS / max_tokens, or use a non-reasoning model preset in LM Studio",
    );
  }

  return "";
}

const DEFAULT_TIMEOUT_MS = 600_000;

function isRunningInContainer(): boolean {
  if (process.env.REMOTE_CONTAINERS === "true") return true;
  return existsSync("/.dockerenv");
}

function defaultBaseUrl(): string {
  return isRunningInContainer()
    ? "http://host.docker.internal:1234/v1"
    : "http://127.0.0.1:1234/v1";
}

/** Strip LangChain-style `openai:` prefix; LM Studio raw API expects the bare model id. */
export function normalizeModelId(model: string): string {
  return model.trim().replace(/^openai:/i, "");
}

export function resolveLlmConfig(env: NodeJS.ProcessEnv = process.env): LlmClientConfig {
  const baseUrl = (
    env.LM_STUDIO_BASE_URL ??
    env.OPENAI_BASE_URL ??
    defaultBaseUrl()
  ).replace(/\/$/, "");

  const rawModel = (env.LM_STUDIO_MODEL ?? env.METAPHOR_ASSIGN_MODEL ?? "").trim();
  const model = normalizeModelId(rawModel);

  const apiKey = env.OPENAI_API_KEY ?? env.LM_STUDIO_API_KEY ?? "lm-studio-local-key";

  const timeoutRaw = (env.LLM_REQUEST_TIMEOUT_MS ?? "").trim();
  const requestTimeoutMs =
    timeoutRaw && Number.isFinite(Number(timeoutRaw)) ? Number(timeoutRaw) : DEFAULT_TIMEOUT_MS;

  return { baseUrl, apiKey, model, requestTimeoutMs };
}

export function loadLlmConfig(): LlmClientConfig {
  const config = resolveLlmConfig();
  if (!config.model) {
    throw new Error(
      [
        "LM_STUDIO_MODEL or METAPHOR_ASSIGN_MODEL is required.",
        "Example: export LM_STUDIO_MODEL=qwen/qwen3.6-27b",
        "Run `npm run metaphor-assign -- ping` to list models from LM Studio.",
      ].join(" "),
    );
  }
  return config;
}

export type LlmHealthResult = {
  ok: boolean;
  baseUrl: string;
  model: string;
  models: string[];
  error?: string;
};

export async function checkLlmHealth(
  config?: Partial<LlmClientConfig>,
): Promise<LlmHealthResult> {
  const resolved = { ...resolveLlmConfig(), ...config };
  const healthTimeoutMs = 10_000;

  try {
    const response = await fetch(`${resolved.baseUrl}/models`, {
      signal: AbortSignal.timeout(healthTimeoutMs),
      headers: resolved.apiKey ? { Authorization: `Bearer ${resolved.apiKey}` } : undefined,
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        baseUrl: resolved.baseUrl,
        model: resolved.model,
        models: [],
        error: `GET /models failed (${response.status}): ${body.slice(0, 300)}`,
      };
    }

    const data = (await response.json()) as ModelsListResponse;
    const models = (data.data ?? [])
      .map((entry) => entry.id?.trim())
      .filter((id): id is string => Boolean(id));

    const modelConfigured = Boolean(resolved.model);
    const modelFound =
      !modelConfigured || models.length === 0 || models.includes(resolved.model);

    return {
      ok: modelFound,
      baseUrl: resolved.baseUrl,
      model: resolved.model,
      models,
      error: modelFound
        ? undefined
        : `Model "${resolved.model}" not in LM Studio. Available: ${models.slice(0, 5).join(", ")}${models.length > 5 ? ", ..." : ""}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      baseUrl: resolved.baseUrl,
      model: resolved.model,
      models: [],
      error: message,
    };
  }
}

export async function chatCompletion(
  config: LlmClientConfig,
  messages: ChatMessage[],
  options: { temperature: number; maxTokens?: number },
): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens ?? 4096,
    enable_thinking: false,
  };

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${bodyText.slice(0, 500)}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const message = data.choices?.[0]?.message;
  if (!message) {
    throw new Error("LLM returned no choices");
  }

  const text = extractMessageText(message);
  if (!text) {
    const reason = data.choices?.[0]?.finish_reason ?? "unknown";
    throw new Error(`LLM returned empty content (finish_reason=${reason})`);
  }
  return text;
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
