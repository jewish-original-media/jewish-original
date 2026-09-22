import Image from "next/image";

import type { PublicFounderPhoto } from "@/content/media/public-assets";

import styles from "./museum-figure.module.css";

type MuseumFigureProps = {
  photo: PublicFounderPhoto;
  sizes: string;
  priority?: boolean;
  tone?: "paper" | "night";
};

export function MuseumFigure({
  photo,
  sizes,
  priority = false,
  tone = "paper",
}: MuseumFigureProps) {
  return (
    <figure
      className={`${styles.figure} ${tone === "night" ? styles.night : ""}`}
    >
      <div className={`${styles.frame} ${styles[photo.crop]}`}>
        <Image
          alt={photo.alt}
          className={`${styles.image} ${
            photo.crop === "street"
              ? styles.streetImage
              : photo.crop === "steps"
                ? styles.stepsImage
                : styles.tefillinImage
          }`}
          fill
          priority={priority}
          sizes={sizes}
          src={photo.src}
        />
      </div>
      <figcaption className={styles.caption}>
        <p className={styles.kind}>{photo.kind}</p>
        <p className={styles.title}>{photo.title}</p>
        <p className={styles.meta}>{photo.placeDate}</p>
        <p className={styles.credit}>{photo.credit}</p>
      </figcaption>
    </figure>
  );
}
