import type { EventGeoBucket } from "../config";

export type EventSourceDefinition = {
  id: string;
  name: string;
  attributionLabel: string;
  canonicalSite: string;
  feedUrl: string | null;
  hosts: readonly string[];
  sourceType: "ics" | "manual";
  defaultGeo: EventGeoBucket;
  defaultOrganizer: string;
  defaultCity?: string;
  defaultRegion?: string;
  defaultCountry?: string;
  perRunCap: number;
  enabled: boolean;
  notes: string;
};

export const EVENT_SOURCE_REGISTRY: readonly EventSourceDefinition[] = [
  {
    id: "huc",
    name: "Hebrew Union College",
    attributionLabel: "Hebrew Union College",
    canonicalSite: "https://huc.edu",
    feedUrl: "https://huc.edu/?ical=1",
    hosts: ["huc.edu"],
    sourceType: "ics",
    defaultGeo: "united-states",
    defaultOrganizer: "Hebrew Union College",
    defaultCountry: "United States",
    perRunCap: 10,
    enabled: true,
    notes: "Official ICS. Do not republish long descriptions.",
  },
  {
    id: "jom-manual",
    name: "Jewish Original Media",
    attributionLabel: "Jewish Original",
    canonicalSite: "https://jewishoriginal.com",
    feedUrl: null,
    hosts: ["jewishoriginal.com"],
    sourceType: "manual",
    defaultGeo: "international",
    defaultOrganizer: "Jewish Original Media",
    perRunCap: 20,
    enabled: true,
    notes: "Studio-entered JOM events. No ICS poll.",
  },
] as const;

export function enabledEventSources() {
  return EVENT_SOURCE_REGISTRY.filter(
    (source) => source.enabled && source.sourceType !== "manual",
  );
}
