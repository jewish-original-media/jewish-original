import type { Metadata } from "next";

import { TrackPageOpen } from "@/components/analytics/track-page-open";
import { JsonLd } from "@/components/seo/json-ld";
import { JewishTodayPage } from "@/components/today/jewish-today-page";
import { getJewishToday } from "@/features/jewish-today";
import { isIsoDate } from "@/features/jewish-today/timezone";
import { breadcrumbJsonLd } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

type TodaySearchParams = {
  date?: string;
  preview?: string;
};

type TodayPageProps = {
  searchParams: Promise<TodaySearchParams>;
};

function resolveTodayRequest(params: TodaySearchParams) {
  const requestedDate =
    params.date && isIsoDate(params.date) ? params.date : undefined;
  const forceCalendarUnavailable =
    process.env.JEWISH_TODAY_ALLOW_PREVIEWS === "1" &&
    params.preview === "calendar-unavailable";

  return { requestedDate, forceCalendarUnavailable };
}

export async function generateMetadata({
  searchParams,
}: TodayPageProps): Promise<Metadata> {
  const { requestedDate, forceCalendarUnavailable } = resolveTodayRequest(
    await searchParams,
  );
  const day = await getJewishToday({
    date: requestedDate,
    forceCalendarUnavailable,
  });

  const title = "Jewish Today";
  const description = day.hebrewDate
    ? `${day.gregorianLabel}. ${day.hebrewDate}. Daily Jewish calendar context from Jewish Original.`
    : `Daily Jewish calendar context for ${day.gregorianLabel}.`;

  return {
    title,
    description,
    alternates: {
      canonical: "/today",
    },
    robots:
      requestedDate || forceCalendarUnavailable
        ? { index: false, follow: true }
        : undefined,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: "/today",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const { requestedDate, forceCalendarUnavailable } = resolveTodayRequest(
    await searchParams,
  );
  const day = await getJewishToday({
    date: requestedDate,
    forceCalendarUnavailable,
  });

  return (
    <>
      {!requestedDate ? <TrackPageOpen event="today_open" /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Jewish Today", path: "/today" },
        ])}
      />
      <JewishTodayPage day={day} />
    </>
  );
}
