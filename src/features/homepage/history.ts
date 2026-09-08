import type { HistoryEntrySummary } from "@/content/history/types";

export type HomeHistoryPresentation = {
  lead: HistoryEntrySummary | null;
  supporting: HistoryEntrySummary[];
  onThisDay: boolean;
  title: "On this day" | "From the archive";
};

export function composeHomeHistory(
  entries: HistoryEntrySummary[],
  onThisDay: HistoryEntrySummary[] = [],
): HomeHistoryPresentation {
  const todayLead = onThisDay[0];
  const lead =
    entries.find((entry) => entry._id === todayLead?._id) ??
    todayLead ??
    entries[0] ??
    null;
  const supporting = entries
    .filter((entry) => entry._id !== lead?._id)
    .slice(0, 3);

  return {
    lead,
    supporting,
    onThisDay: Boolean(todayLead && lead && todayLead._id === lead._id),
    title: todayLead ? "On this day" : "From the archive",
  };
}
