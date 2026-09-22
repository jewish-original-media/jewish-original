import Link from "next/link";

import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { Container } from "@/components/ui/container";
import type { JewishTodayDay } from "@/features/jewish-today";
import { formatGregorianLabel } from "@/features/jewish-today/timezone";
import {
  calendarHighlights,
  formatParashahDisplayTitle,
  sefariaPassageHref,
  torahPortionLabel,
} from "@/lib/jewish-today/display";

import styles from "@/app/today/today.module.css";

type JewishTodayPageProps = {
  day: JewishTodayDay;
};

export function JewishTodayPage({ day }: JewishTodayPageProps) {
  const calendarReady = day.calendarStatus === "ready";
  const highlights = calendarHighlights(day);
  const showCalendar = calendarReady && highlights.length > 0;
  const showTorah = calendarReady && Boolean(day.parashah);
  const showFestival = calendarReady && Boolean(day.festivalShabbat);
  const torahLabel = torahPortionLabel(day.parashah?.readingKind);
  const showHistory = day.onThisDay.length > 0;

  return (
    <article className={`${styles.page} ${styles.roomToday}`}>
      <div className={styles.sequence}>
        <section className={styles.hero}>
          <Container size="content">
            <p className={`eyebrow ${styles.kicker}`}>Jewish Today</p>
            <h1 className={styles.todayTitle}>Today</h1>
            <div className={styles.datePair}>
              <p className={styles.gregorian}>{day.gregorianLabel}</p>
              {day.hebrewDateHebrew || day.hebrewDate ? (
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
              ) : null}
            </div>
            <p className={styles.note}>
              Eastern Time. Jewish days begin at sunset. Torah readings follow
              the Diaspora calendar.
            </p>
            {!calendarReady ? (
              <p className={styles.status} role="status">
                Today’s Hebrew calendar is briefly unavailable. The date and any
                published History still appear below.
              </p>
            ) : null}
          </Container>
        </section>

        {showCalendar ? (
          <section className={styles.section} aria-labelledby="jewish-calendar">
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
              {highlights.length > 1 ? (
                <ul className={styles.list}>
                  {highlights.map((item) => (
                    <li key={item.title}>
                      <p className={styles.listItemTitle}>{item.title}</p>
                      {item.memo ? (
                        <p className={styles.meta}>{item.memo}</p>
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
            className={styles.section}
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
              {day.festivalShabbat.torahReadings.length ? (
                <ul className={styles.studyLinks}>
                  {day.festivalShabbat.torahReadings.map((reading) => (
                    <li key={reading}>
                      <a
                        href={sefariaPassageHref(reading)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Study {reading} on Sefaria
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Container>
          </section>
        ) : null}

        {showTorah && day.parashah ? (
          <section className={styles.section} aria-labelledby="weekly-torah">
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
              {day.parashah.torahReadings.length ? (
                <ul className={styles.studyLinks}>
                  {day.parashah.torahReadings.map((reading) => (
                    <li key={reading}>
                      <a
                        href={sefariaPassageHref(reading)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Study {reading} on Sefaria
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Container>
          </section>
        ) : null}

        <section
          className={styles.historySection}
          aria-labelledby="today-in-history"
        >
          <Container size="content">
            <p className="eyebrow">On This Day</p>
            <h2 className={styles.sectionTitle} id="today-in-history">
              {showHistory
                ? "Published Gregorian anniversaries"
                : "No published anniversary today"}
            </h2>
            {showHistory ? (
              <div className={styles.historyList}>
                {day.onThisDay.map((entry) => (
                  <HistoryEntryCard
                    entry={entry}
                    key={entry._id}
                    variant="archive"
                  />
                ))}
              </div>
            ) : (
              <>
                <p className={styles.historyEmpty}>
                  No verified Gregorian anniversary is published for this date.
                </p>
                <Link className={styles.archiveLink} href="/history">
                  Browse the archive
                </Link>
              </>
            )}
          </Container>
        </section>
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
