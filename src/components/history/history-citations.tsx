import type { HistoryCitation } from "@/content/history/types";

export function HistoryCitations({
  citations,
  preview,
}: {
  citations: HistoryCitation[];
  preview: boolean;
}) {
  if (!citations.length) return null;

  return (
    <section className="history-sources" aria-labelledby="sources-heading">
      <p className="eyebrow">Research trail</p>
      <h2 className="history-section-title" id="sources-heading">
        Sources and further reading
      </h2>
      <ol className="history-sources__list">
        {citations.map((citation) => {
          const label =
            citation.title ||
            citation.source?.name ||
            citation.publication ||
            citation.url ||
            "Untitled source";
          return (
            <li className="history-sources__item" key={citation._key}>
              <cite className="not-italic">{label}</cite>
              {citation.author ? ` — ${citation.author}` : null}
              {citation.publicationDate
                ? ` (${citation.publicationDate})`
                : null}
              {citation.locator ? `, ${citation.locator}` : null}
              {citation.bibliographicDetail
                ? `. ${citation.bibliographicDetail}`
                : null}
              {citation.url ? (
                <>
                  {" "}
                  <a
                    className="text-navy break-words"
                    href={citation.url}
                    rel="noreferrer"
                  >
                    View source
                  </a>
                </>
              ) : null}
              {preview && citation.verificationStatus !== "verified" ? (
                <span className="text-focus ml-2 text-xs font-semibold uppercase">
                  Unreviewed draft source
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
