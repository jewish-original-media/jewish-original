import Image from "next/image";

import { Container } from "@/components/ui/container";
import type { HistoryImage } from "@/content/history/types";

export function HistoryFeaturedMedia({ image }: { image?: HistoryImage }) {
  if (!image) return null;

  return (
    <div className="history-featured-band">
      <Container>
        <figure className="history-featured-media">
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
          {image.caption || image.creditLine ? (
            <figcaption className="history-featured-media__caption">
              {image.caption ? <span>{image.caption}</span> : null}
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
