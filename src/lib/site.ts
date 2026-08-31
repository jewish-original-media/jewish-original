export const siteConfig = {
  name: "Jewish Original Media",
  shortName: "Jewish Original",
  description:
    "A modern home for Jewish history, culture, education, connection, and identity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jewishoriginal.com",
  navigation: [
    { label: "Home", href: "/" },
    { label: "History", href: "/history" },
    { label: "Podcasts", href: "/podcasts" },
    { label: "News", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ],
} as const;
