import type { Metadata } from "next";

import { JewishTodayPage } from "@/components/today/jewish-today-page";
import { getJewishToday } from "@/features/jewish-today";
import { isIsoDate } from "@/features/jewish-today/timezone";

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

  return {
    title: "Jewish Today",
    description: day.hebrewDate
      ? `${day.gregorianLabel}. ${day.hebrewDate}. Daily Jewish calendar context from Jewish Original.`
      : `Daily Jewish calendar context for ${day.gregorianLabel}.`,
    alternates: {
      canonical: "/today",
    },
    robots:
      requestedDate || forceCalendarUnavailable
        ? { index: false, follow: true }
        : undefined,
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

  return <JewishTodayPage day={day} />;
}
