import "server-only";

import { createClient } from "next-sanity";

import { sanityEnv } from "@/sanity/env";

const baseClient = createClient({
  ...sanityEnv,
  perspective: "published",
  requestTagPrefix: "jewish-original",
  stega: false,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: true,
});

export function getPublishedSanityClient() {
  return baseClient;
}

export function getDraftSanityClient() {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) {
    throw new Error(
      "Draft Mode requires the server-only SANITY_API_READ_TOKEN environment variable.",
    );
  }

  return baseClient.withConfig({
    perspective: "drafts",
    stega: false,
    token,
    useCdn: false,
  });
}
