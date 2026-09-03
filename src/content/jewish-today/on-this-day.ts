import type { OnThisDayHistoryEntry } from "@/features/jewish-today/types";

export const ON_THIS_DAY_QUERY = `*[
  _type == "historyEntry" &&
  !(_id in path("drafts.**")) &&
  workflowStatus == "ready" &&
  defined(slug.current) &&
  entryKind != "recurringObservance" &&
  historicalDate.precision == "day" &&
  historicalDate.calendarSystem == "gregorian" &&
  historicalDate.start.month == $month &&
  historicalDate.start.day == $day
] | order(historicalDate.start.year desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "year": historicalDate.start.year,
  "month": historicalDate.start.month,
  "day": historicalDate.start.day,
  "displayText": historicalDate.displayText,
  "topics": coalesce(topics[]->{ "name": name, "slug": slug.current }, []),
  "places": coalesce(places[]->{ "name": name }, []),
  "geographicRegions": coalesce(geographicRegions[]->{ "name": name }, [])
}`;

export type HistoryDateCandidate = {
  entryKind?: string | null;
  workflowStatus?: string | null;
  published?: boolean;
  slug?: string | null;
  historicalDate?: {
    precision?: string | null;
    calendarSystem?: string | null;
    start?: {
      month?: number | null;
      day?: number | null;
      year?: number | null;
    } | null;
  } | null;
};

export function matchesOnThisDayHistory(
  entry: HistoryDateCandidate,
  month: number,
  day: number,
): boolean {
  if (entry.published === false) return false;
  if (entry.workflowStatus === "duplicateCandidate") return false;
  if (entry.workflowStatus && entry.workflowStatus !== "ready") return false;
  if (!entry.slug) return false;
  if (entry.entryKind === "recurringObservance") return false;

  const date = entry.historicalDate;
  if (!date) return false;
  if (date.precision !== "day") return false;
  if (date.calendarSystem !== "gregorian") return false;
  if (date.start?.month !== month || date.start.day !== day) return false;

  return true;
}

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatOnThisDayDate(input: {
  displayText?: string;
  year?: number;
  month?: number;
  day?: number;
}): string | undefined {
  if (input.displayText) return input.displayText;
  if (!input.year || !input.month) return undefined;

  const monthName = MONTH_NAMES[input.month];
  if (!monthName) return String(input.year);
  if (!input.day) return `${monthName} ${input.year}`;
  return `${monthName} ${input.day}, ${input.year}`;
}

type SanityQueryRow = {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  year?: number;
  month?: number;
  day?: number;
  displayText?: string;
  topics?: Array<{ name?: string; slug?: string }>;
  places?: Array<{ name?: string }>;
  geographicRegions?: Array<{ name?: string }>;
};

type SanityQueryResult = {
  result?: SanityQueryRow[];
};

function sanityConfig(): { projectId: string; dataset: string } | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "development";

  if (!projectId) return null;
  return { projectId, dataset };
}

export function mapOnThisDayRows(
  rows: SanityQueryRow[],
): OnThisDayHistoryEntry[] {
  return rows
    .filter(
      (
        entry,
      ): entry is SanityQueryRow & {
        _id: string;
        title: string;
        slug: string;
      } => Boolean(entry._id && entry.title && entry.slug),
    )
    .map((entry) => {
      const topics = (entry.topics ?? []).flatMap((topic) =>
        topic.name && topic.slug
          ? [{ name: topic.name, slug: topic.slug }]
          : [],
      );
      const location =
        entry.places?.find((place) => place.name)?.name ||
        entry.geographicRegions?.find((region) => region.name)?.name;
      const dateLabel = formatOnThisDayDate({
        displayText: entry.displayText,
        year: entry.year,
        month: entry.month,
        day: entry.day,
      });

      return {
        id: entry._id,
        title: entry.title,
        slug: entry.slug,
        href: `/history/${entry.slug}`,
        topics,
        ...(entry.excerpt ? { excerpt: entry.excerpt } : {}),
        ...(typeof entry.year === "number" ? { year: entry.year } : {}),
        ...(dateLabel ? { dateLabel } : {}),
        ...(location ? { location } : {}),
      };
    });
}

export async function fetchOnThisDayHistory(
  month: number,
  day: number,
): Promise<OnThisDayHistoryEntry[]> {
  const config = sanityConfig();
  if (!config) return [];

  const url = new URL(
    `https://${config.projectId}.apicdn.sanity.io/v2025-02-19/data/query/${config.dataset}`,
  );
  url.searchParams.set("query", ON_THIS_DAY_QUERY);
  url.searchParams.set("$month", String(month));
  url.searchParams.set("$day", String(day));

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(8_000),
      next: {
        revalidate: 3600,
        tags: ["history", "jewish-today"],
      },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as SanityQueryResult;
    return mapOnThisDayRows(payload.result ?? []);
  } catch {
    return [];
  }
}
