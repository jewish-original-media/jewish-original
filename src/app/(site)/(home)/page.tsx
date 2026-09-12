import type { Metadata } from "next";

import { HomePageView } from "@/components/home/home-page";
import { getHomePageData } from "@/features/homepage";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default async function HomePage() {
  const data = await getHomePageData();

  return <HomePageView data={data} />;
}
