import Link from "next/link";

import { historyArchiveHref } from "@/content/history/archive";
import type {
  HistoryArchiveFacets,
  HistoryFilterType,
  HistoryReference,
} from "@/content/history/types";

const groups: {
  key: keyof HistoryArchiveFacets;
  type: HistoryFilterType;
  heading: string;
}[] = [
  { key: "topics", type: "topic", heading: "Topics" },
  { key: "eras", type: "era", heading: "Eras" },
  { key: "places", type: "place", heading: "Places" },
  { key: "regions", type: "region", heading: "Regions" },
  { key: "people", type: "person", heading: "People" },
  { key: "organizations", type: "organization", heading: "Organizations" },
];

function TaxonomyGroup({
  heading,
  items,
  type,
}: {
  heading: string;
  items: HistoryReference[];
  type: HistoryFilterType;
}) {
  if (!items.length) return null;

  return (
    <div className="history-taxonomy-group">
      <h3 className="history-taxonomy-heading">{heading}</h3>
      <ul className="history-taxonomy-list">
        {items.map((item) => (
          <li key={`${type}-${item.slug}`}>
            <Link
              href={historyArchiveHref({ filter: { type, slug: item.slug } })}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HistoryTaxonomyNav({
  facets,
}: {
  facets: HistoryArchiveFacets;
}) {
  const visible = groups.filter((group) => facets[group.key].length > 0);

  if (!visible.length) return null;

  return (
    <nav aria-label="Browse published history" className="history-taxonomy-nav">
      {visible.map((group) => (
        <TaxonomyGroup
          heading={group.heading}
          items={facets[group.key]}
          key={group.key}
          type={group.type}
        />
      ))}
    </nav>
  );
}
