import Image from "next/image";

import { Container } from "@/components/ui/container";
import type { HistoryImage, HistoryVisualKind } from "@/content/history/types";

const VISUAL_KIND_LABEL: Record<HistoryVisualKind, string> = {
  photograph: "Photograph",
  illustration: "Original illustration",
  artifact: "Artifact",
  map: "Map",
  manuscript: "Manuscript",
};

export function HistoryFeaturedMedia({ image }: { image?: HistoryImage }) {
  if (!image) return null;
  const kind = image.visualKind ?? "photograph";
  const kindLabel = VISUAL_KIND_LABEL[kind];

  return (
    <div className="history-featured-band">
      <Container>
        <figure className="history-featured-media">
          <p className="history-featured-media__kind">{kindLabel}</p>
          <div className="history-featured-media__frame">
            <Image
              alt={image.alt}
              className="history-featured-media__image"
              fill
              placeholder={image.asset.lqip ? "blur" : "empty"}
              blurDataURL={image.asset.lqip}
              priority
              sizes="(max-width: 1440px) min(100vw, 90rem), 90rem"
              src={image.asset.url}
            />
          </div>
          {image.caption || image.creditLine || image.creator ? (
            <figcaption className="history-featured-media__caption">
              {image.caption ? <span>{image.caption}</span> : null}
              {image.creator ? (
                <span className="history-featured-media__credit">
                  {image.creator}
                </span>
              ) : null}
              {image.creditLine ? (
                <span className="history-featured-media__credit">
                  {image.creditLine}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      </Container>
    </div>
  );
}

export function HistoryMediaAbsent() {
  return (
    <div className="history-section-break" aria-hidden="true">
      <span className="history-gold-rule" />
      <span className="history-archive-mark" />
      <span className="history-gold-rule" />
    </div>
  );
}
