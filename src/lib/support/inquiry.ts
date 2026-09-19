import { siteConfig } from "@/lib/site";

export const SUPPORT_MONTHLY_AMOUNTS = [18, 36, 72] as const;

export const SUPPORT_MONTHLY_OFFERS = {
  18: "monthly-18",
  36: "monthly-36",
  72: "monthly-72",
} as const;

export type SupportInquiryOffer =
  | "one-time"
  | "monthly-18"
  | "monthly-36"
  | "monthly-72"
  | "day-in-jewish-history"
  | "social-post"
  | "podcast-episode"
  | "custom";

const OFFER_LABELS: Record<SupportInquiryOffer, string> = {
  "one-time": "One-time support",
  "monthly-18": "Monthly support, $18",
  "monthly-36": "Monthly support, $36",
  "monthly-72": "Monthly support, $72",
  "day-in-jewish-history": "Sponsor a Day in Jewish History, $360",
  "social-post": "Sponsor a social post, $36",
  "podcast-episode": "Sponsor a podcast episode, $180",
  custom: "Custom partnership inquiry",
};

export function supportInquiryMailto(offer: SupportInquiryOffer) {
  const subject = `Jewish Original support: ${OFFER_LABELS[offer]}`;
  const body = [
    `Offer: ${OFFER_LABELS[offer]}`,
    "Preferred date or episode:",
    "Name:",
    "Email:",
    "Dedication or business:",
    "A brief message:",
    "",
    "Opening this draft does not send a message. Press send when the note is ready.",
  ].join("\n");

  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
