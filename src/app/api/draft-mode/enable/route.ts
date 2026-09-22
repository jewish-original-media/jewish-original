import { timingSafeEqual } from "node:crypto";

import { draftMode } from "next/headers";

import { getDraftCandidateSlug } from "@/content/history/fetch";
import {
  getDraftPodcastCandidate,
  getDraftPodcastShowCandidate,
} from "@/content/podcasts/fetch";

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return url.origin;
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    url.protocol.replace(/:$/, "") ||
    "http";
  return `${protocol}://${host}`;
}

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
  const type = searchParams.get("type") || "history";
  if (
    !secretsMatch(secret, expectedSecret) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return new Response("Invalid preview request.", { status: 401 });
  }

  let destination: URL;
  if (type === "podcast") {
    const candidate = await getDraftPodcastCandidate(slug);
    if (!candidate?.showSlug) {
      return new Response("Preview candidate not found.", { status: 404 });
    }
    destination = new URL(
      `/podcasts/${candidate.showSlug}/${candidate.slug}`,
      requestOrigin(request),
    );
  } else if (type === "podcast-show") {
    const candidate = await getDraftPodcastShowCandidate(slug);
    if (!candidate) {
      return new Response("Preview candidate not found.", { status: 404 });
    }
    destination = new URL(
      `/podcasts/${candidate.slug}`,
      requestOrigin(request),
    );
  } else {
    const candidate = await getDraftCandidateSlug(slug);
    if (!candidate) {
      return new Response("Preview candidate not found.", { status: 404 });
    }
    destination = new URL(`/history/${candidate.slug}`, requestOrigin(request));
  }

  const draft = await draftMode();
  draft.enable();
  return Response.redirect(destination, 307);
}
