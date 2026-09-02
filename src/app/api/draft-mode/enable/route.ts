import { timingSafeEqual } from "node:crypto";

import { draftMode } from "next/headers";

import { getDraftCandidateSlug } from "@/content/history/fetch";

function secretsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  const expectedSecret = process.env.DRAFT_MODE_SECRET;
  if (!expectedSecret || !process.env.SANITY_API_READ_TOKEN) {
    return new Response("Draft preview is not configured.", { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret") || "";
  const slug = searchParams.get("slug") || "";
  if (
    !secretsMatch(secret, expectedSecret) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return new Response("Invalid preview request.", { status: 401 });
  }

  const candidate = await getDraftCandidateSlug(slug);
  if (!candidate) {
    return new Response("Preview candidate not found.", { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();
  return Response.redirect(
    new URL(`/history/${candidate.slug}`, request.url),
    307,
  );
}
