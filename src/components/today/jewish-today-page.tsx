import Image from "next/image";
import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { ArchiveTrail } from "@/components/explore/archive-trail";
import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { Container } from "@/components/ui/container";
import type { PublicEventCard } from "@/content/events/types";
import type { HistoryEntrySummary } from "@/content/history/types";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";
import type { CuratedNewsCard } from "@/content/news/types";
import type { JewishTodayDay } from "@/features/jewish-today";
import {
  shouldShowHomepageEvents,
  shouldShowHomepageNews,
} from "@/features/ingest/select";
import { formatGregorianLabel } from "@/features/jewish-today/timezone";
import { eventDateParts, eventPlaceLabel } from "@/lib/events/display";
import { formatHistoricalDate } from "@/lib/history/format-date";
import {
  calendarHighlights,
  firstSentence,
  formatParashahDisplayTitle,
  hebcalSourceLabel,
  sefariaPassageHref,
  torahReadingContext,
  torahPortionLabel,
} from "@/lib/jewish-today/display";
import { formatNewsTime, newsDeskLabel } from "@/lib/news/display";

import styles from "@/app/today/today.module.css";

type JewishTodayPageProps = {
  day: JewishTodayDay;
  events?: PublicEventCard[];
  news?: CuratedNewsCard[];
  previousHistory?: HistoryEntrySummary[];
};

function ReadingGroup({
  label,
  readings,
}: {
  label: string;
  readings: string[];
}) {
  if (!readings.length) return null;

  return (
    <div className={styles.readingGroup}>
      <p className={styles.readingLabel}>{label}</p>
      <ul className={styles.studyLinks}>
        {readings.map((reading) => (
          <li key={`${label}-${reading}`}>
            <a
              href={sefariaPassageHref(reading)}
              rel="noopener noreferrer"
              target="_blank"
            >
              {reading}
              <span className="sr-only"> on Sefaria (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CurrentPanels({
  events,
  news,
}: {
  events: PublicEventCard[];
  news: CuratedNewsCard[];
}) {
  const showNews = shouldShowHomepageNews(news.length);
  const showEvents = shouldShowHomepageEvents(events);
  if (!showNews && !showEvents) return null;

  return (
    <section
      aria-labelledby="today-current"
      className={`${styles.panel} ${styles.currentPanel}`}
    >
      <p className="eyebrow">The Jewish present</p>
      <h2 className={styles.sectionTitle} id="today-current">
        Current
      </h2>
      <div className={styles.currentGrid}>
        {showNews ? (
          <div className={styles.currentColumn}>
            <div className={styles.currentHeading}>
              <h3>What we’re following</h3>
              <Link href="/news">Full desk</Link>
            </div>
            <ol className={styles.currentList}>
              {news.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <TrackedAnchor
                    event="news_outbound"
                    href={item.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className={styles.currentMeta}>
                      {item.publisher} · {newsDeskLabel(item.desk)} ·{" "}
                      {formatNewsTime(item.sourcePublishedAt)}
                    </span>
                    <strong>{item.headline}</strong>
                  </TrackedAnchor>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {showEvents ? (
          <div className={styles.currentColumn}>
            <div className={styles.currentHeading}>
              <h3>Upcoming events</h3>
              <Link href="/events">Full calendar</Link>
            </div>
            <ol className={styles.currentList}>
              {events.slice(0, 3).map((item) => {
                const date = eventDateParts(item.startAt, item.timezone);
                return (
                  <li key={item.id}>
                    <TrackedAnchor
                      event="event_outbound"
                      href={item.eventUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className={styles.currentMeta}>
                        {date.month} {date.day} · {eventPlaceLabel(item)}
                      </span>
                      <strong>{item.title}</strong>
                    </TrackedAnchor>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function JewishTodayPage({
  day,
  events = [],
  news = [],
  previousHistory = [],
}: JewishTodayPageProps) {
  const calendarReady = day.calendarStatus === "ready";
  const highlights = calendarHighlights(day);
  const showCalendar = calendarReady && highlights.length > 0;
  const showTorah = calendarReady && Boolean(day.parashah);
  const showFestival = calendarReady && Boolean(day.festivalShabbat);
  const torahLabel = torahPortionLabel(day.parashah?.readingKind);
  const showHistory = day.onThisDay.length > 0;
  const historyEntries = showHistory ? day.onThisDay : previousHistory;
  const showPreviousHistory = !showHistory && previousHistory.length > 0;

  return (
    <article className={`${styles.page} ${styles.roomToday}`}>
      <div className={styles.sequence}>
        <section className={styles.hero}>
          <Container>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={`eyebrow ${styles.kicker}`}>Jewish Today</p>
                <h1 className={styles.todayTitle}>Today</h1>
                <div className={styles.dateLedger}>
                  <div className={styles.dateLedgerItem}>
                    <p className={styles.dateLabel}>Gregorian day</p>
                    <p className={styles.gregorian}>{day.gregorianLabel}</p>
                  </div>
                  {day.hebrewDateHebrew || day.hebrewDate ? (
                    <div className={styles.dateLedgerItem}>
                      <p className={styles.dateLabel}>Hebrew day</p>
                      <p className={styles.hebrewPair}>
                        {day.hebrewDateHebrew ? (
                          <span lang="he" dir="rtl">
                            {day.hebrewDateHebrew}
                          </span>
                        ) : null}
                        {day.hebrewDate ? (
                          <span>
                            {day.hebrewDate}
                            {day.isShabbat ? " · Shabbat" : ""}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                </div>
                <p className={styles.note}>
                  Eastern Time. Jewish days begin at sunset. Torah readings
                  follow the Diaspora calendar.
                </p>
                {!calendarReady ? (
                  <p className={styles.status} role="status">
                    Today’s Hebrew calendar is briefly unavailable. The date and
                    any published History still appear below.
                  </p>
                ) : null}
              </div>
              <figure className={styles.heroFigure}>
                <Image
                  alt={FOUNDER_PHOTOS.archive.alt}
                  fill
                  sizes="(min-width: 64rem) 38vw, 100vw"
                  src={FOUNDER_PHOTOS.archive.src}
                />
                <figcaption>
                  <span>{FOUNDER_PHOTOS.archive.title}</span>
                  <span>{FOUNDER_PHOTOS.archive.credit}</span>
                </figcaption>
              </figure>
              <div className={styles.heroMark} aria-hidden="true" />
            </div>
          </Container>
        </section>
        <ArchiveTrail current="today" />
        <Container className={styles.dashboard}>
          {showCalendar ? (
            <section
              className={`${styles.section} ${styles.panel}`}
              aria-labelledby="jewish-calendar"
            >
              <Container size="content">
                <p className="eyebrow">Today’s observance</p>
                <h2 className={styles.sectionTitle} id="jewish-calendar">
                  {highlights.length === 1
                    ? highlights[0]?.title
                    : "On the calendar"}
                </h2>
                {highlights.length === 1 && highlights[0]?.memo ? (
                  <p className={styles.sectionLede}>{highlights[0].memo}</p>
                ) : null}
                {highlights.length === 1 && highlights[0]?.sourceHref ? (
                  <a
                    className={styles.sourceLink}
                    href={highlights[0].sourceHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {hebcalSourceLabel(highlights[0].title)}
                  </a>
                ) : null}
                {highlights.length > 1 ? (
                  <ul className={styles.list}>
                    {highlights.map((item) => (
                      <li key={item.title}>
                        <p className={styles.listItemTitle}>{item.title}</p>
                        {item.memo ? (
                          <p className={styles.meta}>{item.memo}</p>
                        ) : null}
                        {item.sourceHref ? (
                          <a
                            className={styles.sourceLink}
                            href={item.sourceHref}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {hebcalSourceLabel(item.title)}
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Container>
            </section>
          ) : null}

          {showFestival && day.festivalShabbat ? (
            <section
              className={`${styles.section} ${styles.panel}`}
              aria-labelledby="festival-reading"
            >
              <Container size="content">
                <p className="eyebrow">Festival</p>
                <h2 className={styles.sectionTitle} id="festival-reading">
                  {day.festivalShabbat.title}
                </h2>
                {day.festivalShabbat.titleHebrew ? (
                  <p className={styles.sectionHebrew} lang="he" dir="rtl">
                    {day.festivalShabbat.titleHebrew}
                  </p>
                ) : null}
                <p className={styles.meta}>
                  {`Read ${formatGregorianLabel(day.festivalShabbat.observedOn)}`}
                </p>
                {firstSentence(day.festivalShabbat.memo) ? (
                  <p className={styles.sectionLede}>
                    {firstSentence(day.festivalShabbat.memo)}
                  </p>
                ) : null}
                {torahReadingContext(day.festivalShabbat.torahReadings) ? (
                  <p className={styles.knowledgeNote}>
                    {torahReadingContext(day.festivalShabbat.torahReadings)}
                  </p>
                ) : null}
                <div className={styles.readingGrid}>
                  <ReadingGroup
                    label="Torah"
                    readings={day.festivalShabbat.torahReadings}
                  />
                  <ReadingGroup
                    label="Maftir"
                    readings={day.festivalShabbat.maftirReadings}
                  />
                  <ReadingGroup
                    label="Haftarah"
                    readings={day.festivalShabbat.haftarahReadings}
                  />
                </div>
                {day.festivalShabbat.sourceHref ? (
                  <a
                    className={styles.sourceLink}
                    href={day.festivalShabbat.sourceHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {hebcalSourceLabel(day.festivalShabbat.title)}
                  </a>
                ) : null}
              </Container>
            </section>
          ) : null}

          {showTorah && day.parashah ? (
            <section
              className={`${styles.section} ${styles.panel} ${styles.torahPanel}`}
              aria-labelledby="weekly-torah"
            >
              <Container size="content">
                <p className="eyebrow">{torahLabel}</p>
                <div className={styles.torahPair}>
                  <h2 className={styles.sectionTitle} id="weekly-torah">
                    {formatParashahDisplayTitle(day.parashah.title)}
                  </h2>
                  {day.parashah.titleHebrew ? (
                    <p className={styles.sectionHebrew} lang="he" dir="rtl">
                      {day.parashah.titleHebrew}
                    </p>
                  ) : null}
                </div>
                <p className={styles.meta}>
                  {day.parashah.observedOn === day.gregorianDate
                    ? "Read this Shabbat"
                    : `Read ${formatGregorianLabel(day.parashah.observedOn)}`}
                </p>
                {firstSentence(day.parashah.memo) ? (
                  <p className={styles.sectionLede}>
                    {firstSentence(day.parashah.memo)}
                  </p>
                ) : null}
                {torahReadingContext(day.parashah.torahReadings) ? (
                  <p className={styles.knowledgeNote}>
                    {torahReadingContext(day.parashah.torahReadings)}
                  </p>
                ) : null}
                <div className={styles.readingGrid}>
                  <ReadingGroup
                    label="Torah"
                    readings={day.parashah.torahReadings}
                  />
                  <ReadingGroup
                    label="Maftir"
                    readings={day.parashah.maftirReadings}
                  />
                  <ReadingGroup
                    label="Haftarah"
                    readings={day.parashah.haftarahReadings}
                  />
                </div>
                {day.parashah.sourceHref ? (
                  <a
                    className={styles.sourceLink}
                    href={day.parashah.sourceHref}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {hebcalSourceLabel(day.parashah.title)}
                  </a>
                ) : null}
              </Container>
            </section>
          ) : null}

          <section
            className={`${styles.historySection} ${styles.panel} ${styles.historyPanel}`}
            aria-labelledby="today-in-history"
          >
            <Container size="content">
              <p className="eyebrow">On This Day</p>
              <h2 className={styles.sectionTitle} id="today-in-history">
                {showHistory
                  ? "Published Gregorian anniversaries"
                  : showPreviousHistory
                    ? "Previous date in the archive"
                    : "No published anniversary today"}
              </h2>
              {historyEntries.length ? (
                <>
                  <div className={styles.historyList}>
                    {historyEntries.slice(0, 3).map((entry) => (
                      <HistoryEntryCard
                        entry={entry}
                        key={entry._id}
                        variant="archive"
                      />
                    ))}
                  </div>
                  {showPreviousHistory ? (
                    <p className={styles.historyEmpty}>
                      The nearest earlier Gregorian date represented in the
                      reviewed archive is{" "}
                      {formatHistoricalDate(
                        historyEntries[0]?.historicalDate,
                        historyEntries[0]?.entryKind,
                        historyEntries[0]?.observanceRule,
                      )}
                      . It is shown as an archive path, not as an anniversary
                      for today.
                    </p>
                  ) : null}
                  <p className={styles.archivePaths}>
                    <Link href="/history">Browse every date</Link>
                    <span aria-hidden="true"> · </span>
                    <Link href="/explore">Follow every archive thread</Link>
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.historyEmpty}>
                    No verified Gregorian anniversary is published for this
                    date.
                  </p>
                  <Link className={styles.archiveLink} href="/history">
                    Browse the archive
                  </Link>
                </>
              )}
            </Container>
          </section>
          <CurrentPanels events={events} news={news} />
        </Container>
      </div>

      <footer className={styles.credit}>
        <Container>
          <p className={styles.attribution}>
            Calendar by{" "}
            <a href={day.attribution.href} rel="noreferrer">
              Hebcal
            </a>
            .
          </p>
        </Container>
      </footer>
    </article>
  );
}
