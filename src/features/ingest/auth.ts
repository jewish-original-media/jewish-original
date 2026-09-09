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
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return { ok: false as const, status: 503, error: "cron-unconfigured" };
  }

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") || "";
  const received = bearer || query;
  if (!received || !secretsMatch(received, expected)) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }
  return { ok: true as const };
}
