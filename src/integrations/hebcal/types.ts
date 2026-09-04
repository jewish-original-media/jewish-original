export type HebcalHeDateParts = {
  y?: string;
  m?: string;
  d?: string;
};

export type HebcalOmerDetails = {
  count?: {
    he?: string;
    en?: string;
  };
  sefira?: {
    he?: string;
    translit?: string;
    en?: string;
  };
};

export type HebcalItem = {
  title: string;
  date: string;
  hdate?: string;
  category: string;
  subcat?: string;
  hebrew?: string;
  memo?: string;
  yomtov?: boolean;
  title_orig?: string;
  heDateParts?: HebcalHeDateParts;
  omer?: HebcalOmerDetails;
  link?: string;
};

export type HebcalCalendarResponse = {
  title?: string;
  date?: string;
  version?: string;
  range?: {
    start: string;
    end: string;
  };
  items?: HebcalItem[];
};

export const HEBCAL_ATTRIBUTION = {
  provider: "hebcal" as const,
  label: "Jewish calendar data from Hebcal.com",
  href: "https://www.hebcal.com",
};
