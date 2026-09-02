import Link from "next/link";

import type { HistoryFilter, HistoryReference } from "@/content/history/types";

export function HistoryReferenceList({
  heading,
  items,
  filterType,
}: {
  heading: string;
  items: HistoryReference[];
  filterType?: HistoryFilter["type"];
}) {
  if (!items.length) return null;

  return (
    <div>
      <h3 className="history-kicker">{heading}</h3>
      <ul className="history-reference-list">
        {items.map((item) => (
          <li key={`${heading}-${item.slug}`}>
            {filterType ? (
              <Link
                className="history-reference-link"
                href={`/history?${filterType}=${encodeURIComponent(item.slug)}`}
              >
                {item.name}
              </Link>
            ) : (
              <span className="history-reference-item">{item.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
