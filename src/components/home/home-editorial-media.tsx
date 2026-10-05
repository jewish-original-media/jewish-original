import Image from "next/image";
import Link from "next/link";

import type { HistoryImage } from "@/content/history/types";

import styles from "@/app/home.module.css";

type HomeEditorialMediaProps = {
  context?: "history" | "originals";
  href: string;
  image?: HistoryImage | null;
  title: string;
  variant: "lead" | "supporting" | "feature";
};

export function HomeEditorialMedia({
  context = "history",
  href,
  image,
  title,
  variant,
}: HomeEditorialMediaProps) {
  const frameClass = {
    feature: styles.storyMediaFeature,
    lead: styles.storyMediaLead,
    supporting: styles.storyMediaSupporting,
  }[variant];
  const sizes =
    variant === "feature"
      ? "(max-width: 47.98rem) 100vw, 62vw"
      : variant === "lead"
        ? "(max-width: 47.98rem) 100vw, (max-width: 63.98rem) 88vw, 55vw"
        : "(max-width: 47.98rem) 100vw, (max-width: 63.98rem) 45vw, 24rem";

  return (
    <figure
      className={`${styles.storyFigure} ${frameClass}`}
      data-media-context={context}
    >
      <Link
        aria-label={`Read ${title}`}
        className={styles.storyMediaLink}
        href={href}
      >
        {image ? (
          <Image
            alt={image.alt}
            className={styles.storyMediaImage}
            fill
            placeholder={image.asset.lqip ? "blur" : "empty"}
            blurDataURL={image.asset.lqip}
            sizes={sizes}
            src={image.asset.url}
          />
        ) : (
          <span
            aria-hidden="true"
            className={styles.storyMediaFallback}
            data-home-media-fallback
          >
            {context === "history" ? (
              <span className={styles.storyMediaLion} />
            ) : (
              <span className={styles.storyMediaMonogram}>JO</span>
            )}
            <span className={styles.storyMediaIndex}>
              {context === "history" ? "JOM / HISTORY" : "JOM / ORIGINAL"}
            </span>
            <span className={styles.storyMediaStar} />
          </span>
        )}
      </Link>
      {image?.caption || image?.creditLine ? (
        <figcaption className={styles.storyMediaCaption}>
          {image.caption ? <span>{image.caption}</span> : null}
          {image.creditLine ? <span>{image.creditLine}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
