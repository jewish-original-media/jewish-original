export type TorahBriefCitation = {
  title?: string;
  author?: string;
  publication?: string;
  kind?: string;
  url: string;
  locator?: string;
  quotation?: string;
};

export type TorahPortionTeaching = {
  tradition: string;
  quotation: string;
  reflection?: string;
  citation: TorahBriefCitation;
};

export type TorahPortionBrief = {
  canonicalTitle: string;
  observedOn: string;
  hebcalSourceHref: string;
  synopsis: string;
  synopsisCitations: TorahBriefCitation[];
  teaching?: TorahPortionTeaching;
};
