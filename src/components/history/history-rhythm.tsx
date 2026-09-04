import Image from "next/image";

type HistoryContextualFactProps = {
  label?: string;
  text?: string;
};

export function HistoryContextualFact({
  label,
  text,
}: HistoryContextualFactProps) {
  if (!text?.trim()) return null;

  return (
    <aside className="history-fact" aria-label={label || "Context"}>
      {label ? <p className="eyebrow">{label}</p> : null}
      <p className="history-fact__text">{text}</p>
    </aside>
  );
}

type HistoryTimelineMarkerProps = {
  date?: string;
  note?: string;
};

export function HistoryTimelineMarker({
  date,
  note,
}: HistoryTimelineMarkerProps) {
  if (!date?.trim() && !note?.trim()) return null;

  return (
    <p className="history-timeline-marker">
      {date ? <strong>{date}</strong> : null}
      {date && note ? <span aria-hidden="true"> · </span> : null}
      {note ? <span>{note}</span> : null}
    </p>
  );
}

type HistoryArtifactProps = {
  src?: string;
  alt?: string;
  caption?: string;
  creditLine?: string;
};

export function HistoryArtifact({
  src,
  alt,
  caption,
  creditLine,
}: HistoryArtifactProps) {
  if (!src || !alt?.trim()) return null;

  return (
    <figure className="history-artifact">
      <div className="history-featured-media__frame history-artifact__frame">
        <Image
          alt={alt}
          className="history-featured-media__image"
          fill
          sizes="(max-width: 45rem) 100vw, 45rem"
          src={src}
        />
      </div>
      {caption || creditLine ? (
        <figcaption className="history-featured-media__caption">
          {caption ? <span>{caption}</span> : null}
          {creditLine ? (
            <span className="history-featured-media__credit">{creditLine}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
