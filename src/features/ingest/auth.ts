import { timingSafeEqual } from "node:crypto";

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function authorizeCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const previewSecret =
    process.env.VERCEL_ENV === "preview"
      ? process.env.DRAFT_MODE_SECRET
      : undefined;
  if (!cronSecret && !previewSecret) {
    return { ok: false as const, status: 503, error: "cron-unconfigured" };
  }

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") || "";
  const received = bearer || query;
  const authorized = [cronSecret, previewSecret].some(
    (expected) => expected && received && secretsMatch(received, expected),
  );
  if (!authorized) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }
  return { ok: true as const };
}
