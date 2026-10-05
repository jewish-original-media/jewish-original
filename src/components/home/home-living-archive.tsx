import Image from "next/image";

import { LIVING_ARCHIVE_OBJECTS } from "@/content/media/living-archive";

import styles from "@/app/home.module.css";

export function HomeLivingArchive() {
  return (
    <section
      className={`${styles.band} ${styles.livingArchiveScene}`}
      id="living-archive"
      aria-labelledby="home-living-archive"
      data-home-living-archive
    >
      <div className={`${styles.bandInner} ${styles.livingArchiveInner}`}>
        <header className={styles.livingArchiveIntroduction}>
          <p className={styles.sectionLabel}>A living archive</p>
          <h2 className={styles.livingArchiveTitle} id="home-living-archive">
            One people.
            <br />
            Many places.
            <br />
            Time carried forward.
          </h2>
          <p className={styles.livingArchiveDek}>
            Jewish identity has always moved through languages, cities, rituals,
            arguments, melodies, and memory. These are not decorative fragments.
            They are documented lives.
          </p>
        </header>

        <div className={styles.archiveCollage}>
          {LIVING_ARCHIVE_OBJECTS.map((object, index) => (
            <figure
              className={styles.archiveObject}
              data-archive-position={index + 1}
              key={object.id}
            >
              <div className={styles.archiveObjectImage}>
                <Image
                  alt={object.alt}
                  fill
                  sizes={
                    index === 0
                      ? "(max-width: 47.98rem) 88vw, 48vw"
                      : "(max-width: 47.98rem) 76vw, 31vw"
                  }
                  src={object.src}
                />
                <span className={styles.archiveObjectNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className={styles.archiveObjectCaption}>
                <span className={styles.archiveObjectCommunity}>
                  {object.community}
                </span>
                <span className={styles.archiveObjectName}>{object.title}</span>
                <span>
                  {object.place} · {object.date}
                </span>
                <a href={object.sourcePageUrl} rel="noreferrer" target="_blank">
                  {object.creditLine} <span aria-hidden="true">↗</span>
                </a>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className={styles.archiveContinuum} data-archive-continuum>
          <span>Samarkand</span>
          <span aria-hidden="true">↗</span>
          <span>New York</span>
          <span aria-hidden="true">↗</span>
          <span>Yemenite Jewish life</span>
          <span aria-hidden="true">↗</span>
          <span>Jerusalem</span>
          <span aria-hidden="true">↗</span>
          <span>Wherever Jewish life is carried</span>
        </p>
      </div>
    </section>
  );
}
