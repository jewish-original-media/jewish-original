import Image from "next/image";
import Link from "next/link";

import { HistoryCitations } from "@/components/history/history-citations";
import { OriginalsBody } from "@/components/originals/originals-body";
import { Container } from "@/components/ui/container";
import type { OriginalArticle } from "@/content/originals/types";
import { authorLine, formatOriginalDate } from "@/lib/originals/display";

import styles from "@/app/originals.module.css";

export function OriginalsArticleView({
  article,
  preview,
}: {
  article: OriginalArticle;
  preview: boolean;
}) {
  const relatedHistory = article.relatedHistory.filter((item) => item.entry);
  const relatedPodcasts = article.relatedPodcastEpisodes.filter(
    (item) => item.episode?.showSlug && item.episode.slug,
  );

  return (
    <article className={styles.page}>
      <header className={styles.articleHero}>
        <Container size="content">
          <nav aria-label="Breadcrumb">
            <ol className={styles.breadcrumb}>
              <li>
                <Link href="/">Jewish Original</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/originals">Originals</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>
          <p className={styles.kicker}>Originals</p>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          {article.excerpt ? (
            <p className={styles.articleLede}>{article.excerpt}</p>
          ) : null}
          <p className={styles.articleMeta}>
            <span>{authorLine(article.authors) || "Jewish Original"}</span>
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>
                {formatOriginalDate(article.publishedAt)}
              </time>
            ) : null}
          </p>
        </Container>
      </header>

      {article.featuredMedia ? (
        <Container>
          <figure className={styles.figure}>
            <div className={styles.figureFrame}>
              <Image
                alt={article.featuredMedia.alt}
                blurDataURL={article.featuredMedia.asset.lqip}
                fill
                placeholder={
                  article.featuredMedia.asset.lqip ? "blur" : "empty"
                }
                priority
                sizes="(max-width: 47.98rem) 100vw, 42rem"
                src={article.featuredMedia.asset.url}
              />
            </div>
            {article.featuredMedia.caption ||
            article.featuredMedia.creditLine ? (
              <figcaption className={styles.caption}>
                {article.featuredMedia.caption}
                {article.featuredMedia.creditLine
                  ? ` ${article.featuredMedia.creditLine}`
                  : ""}
              </figcaption>
            ) : null}
          </figure>
        </Container>
      ) : null}

      <div className={styles.body}>
        <Container size="content">
          <OriginalsBody value={article.body} />
          <HistoryCitations citations={article.citations} preview={preview} />
          {relatedHistory.length || relatedPodcasts.length ? (
            <aside className={styles.related} aria-label="Related">
              {relatedHistory.length ? (
                <>
                  <p className={styles.kicker}>From the archive</p>
                  <ul className={styles.relatedList}>
                    {relatedHistory.map((item) =>
                      item.entry ? (
                        <li key={item.entry.slug}>
                          <Link href={`/history/${item.entry.slug}`}>
                            {item.entry.title}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </>
              ) : null}
              {relatedPodcasts.length ? (
                <>
                  <p className={styles.kicker}>From the show</p>
                  <ul className={styles.relatedList}>
                    {relatedPodcasts.map((item) =>
                      item.episode ? (
                        <li key={item.episode.slug}>
                          <Link
                            href={`/podcasts/${item.episode.showSlug}/${item.episode.slug}`}
                          >
                            {item.episode.title}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </>
              ) : null}
            </aside>
          ) : null}
        </Container>
      </div>
    </article>
  );
}
