import {
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  FALLBACK_AI_MODEL,
  INGEST_BUDGET,
} from "../config";
import type {
  AiCallResult,
  AiProviderStatus,
  EventAiOutput,
  NewsAiOutput,
} from "./types";
import {
  EVENT_SYSTEM_PROMPT,
  NEWS_SYSTEM_PROMPT,
  wrapSourceData,
} from "./prompts";
import {
  parseJsonObject,
  validateEventAiOutput,
  validateNewsAiOutput,
} from "./validate";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

export function resolveAiProvider(): AiProviderStatus {
  const key = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  const model = process.env.NEWS_AI_MODEL || DEFAULT_AI_MODEL;
  const fallback = process.env.NEWS_AI_FALLBACK_MODEL || FALLBACK_AI_MODEL;
  if (!key) {
    return { ready: false, reason: "unconfigured" };
  }
  return {
    ready: true,
    provider: DEFAULT_AI_PROVIDER,
    model,
    fallbackModel: fallback,
  };
}

export function estimateCallUsd() {
  const tokens = INGEST_BUDGET.estimatedTokensPerCall;
  return (tokens / 1_000_000) * 0.1 + (180 / 1_000_000) * 0.4;
}

type ChatJsonArgs = {
  system: string;
  user: string;
  model: string;
};

async function gatewayJson({ system, user, model }: ChatJsonArgs) {
  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) {
    return { ok: false as const, error: "unconfigured" };
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return { ok: false as const, error: `gateway-${response.status}` };
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return { ok: false as const, error: "empty-model-output" };
  return {
    ok: true as const,
    content,
    usage: {
      input: payload.usage?.prompt_tokens ?? 0,
      output: payload.usage?.completion_tokens ?? 0,
    },
  };
}

export async function classifyNewsItem(input: {
  publisher: string;
  headline: string;
  host: string;
  publishedAt: string;
  sourceText: string;
  defaultDesk: string;
}): Promise<AiCallResult<NewsAiOutput>> {
  const provider = resolveAiProvider();
  if (!provider.ready) return { ok: false, error: "unconfigured" };

  const user = wrapSourceData({
    publisher: input.publisher,
    headline: input.headline,
    host: input.host,
    publishedAt: input.publishedAt,
    sourceText: input.sourceText,
    defaultDesk: input.defaultDesk,
  });

  let lastError = "schema-validation-failed";
  for (const model of [provider.model, provider.fallbackModel]) {
    const result = await gatewayJson({
      system: NEWS_SYSTEM_PROMPT,
      user,
      model,
    });
    if (!result.ok) {
      lastError = result.error;
      continue;
    }
    try {
      const parsed = validateNewsAiOutput(
        parseJsonObject(result.content),
        input.sourceText,
      );
      if (parsed.ok) {
        return { ok: true, output: parsed.output, model, usage: result.usage };
      }
      lastError = parsed.error;
    } catch {
      lastError = "unparseable-json";
    }
  }

  return { ok: false, error: lastError };
}

export async function classifyEventItem(input: {
  title: string;
  organizer: string;
  location: string;
  startAt: string;
  timezone: string;
  sourceText: string;
}): Promise<AiCallResult<EventAiOutput>> {
  const provider = resolveAiProvider();
  if (!provider.ready) return { ok: false, error: "unconfigured" };

  const user = wrapSourceData({
    title: input.title,
    organizer: input.organizer,
    location: input.location,
    startAt: input.startAt,
    timezone: input.timezone,
    sourceText: input.sourceText,
  });

  let lastError = "schema-validation-failed";
  for (const model of [provider.model, provider.fallbackModel]) {
    const result = await gatewayJson({
      system: EVENT_SYSTEM_PROMPT,
      user,
      model,
    });
    if (!result.ok) {
      lastError = result.error;
      continue;
    }
    try {
      const parsed = validateEventAiOutput(parseJsonObject(result.content));
      if (parsed.ok) {
        return { ok: true, output: parsed.output, model, usage: result.usage };
      }
      lastError = parsed.error;
    } catch {
      lastError = "unparseable-json";
    }
  }

  return { ok: false, error: lastError };
}
