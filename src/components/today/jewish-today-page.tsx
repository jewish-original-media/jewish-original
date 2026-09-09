import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { Container } from "@/components/ui/container";
import type { JewishTodayDay } from "@/features/jewish-today";
import { formatGregorianLabel } from "@/features/jewish-today/timezone";
import {
  calendarHighlights,
  formatParashahDisplayTitle,
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
  const showHistory = day.onThisDay.length > 0;

  return (
    <article className={`${styles.page} ${styles.roomToday}`}>
      <section className={styles.hero}>
        <div className={styles.heroRule} aria-hidden="true" />
        <Container>
          <p className={`eyebrow ${styles.kicker}`}>Jewish Today</p>
          <h1 className={styles.todayTitle}>Today</h1>
          <p className={styles.gregorian}>{day.gregorianLabel}</p>
          {day.hebrewDateHebrew ? (
            <p className={styles.hebrew} lang="he" dir="rtl">
              {day.hebrewDateHebrew}
            </p>
          ) : null}
          {day.hebrewDate ? (
            <p className={styles.hebrewLatin}>
              {day.hebrewDate}
              {day.isShabbat ? " · Shabbat" : ""}
            </p>
          ) : null}
          <p className={styles.note}>
            Shown for Eastern Time. Jewish days begin at sunset.
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
          <Container>
            <p className="eyebrow">Jewish calendar</p>
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

      {showTorah && day.parashah ? (
        <section
          className={styles.section}
          aria-labelledby="this-week-in-torah"
        >
          <Container>
            <p className="eyebrow">This week in Torah</p>
            <h2 className={styles.sectionTitle} id="this-week-in-torah">
              {formatParashahDisplayTitle(day.parashah.title)}
            </h2>
            {day.parashah.titleHebrew ? (
              <p className={styles.sectionHebrew} lang="he" dir="rtl">
                {day.parashah.titleHebrew}
              </p>
            ) : null}
            <p className={styles.meta}>
              {day.parashah.observedOn === day.gregorianDate
                ? "Read this Shabbat"
                : `Read ${formatGregorianLabel(day.parashah.observedOn)}`}
            </p>
          </Container>
        </section>
      ) : null}

      {showHistory ? (
        <section
          className={styles.historySection}
          aria-labelledby="today-in-history"
        >
          <Container size="content">
            <p className="eyebrow">From the archive</p>
            <h2 className={styles.sectionTitle} id="today-in-history">
              Today in Jewish History
            </h2>
            <div className={styles.historyList}>
              {day.onThisDay.map((entry) => (
                <HistoryEntryCard
                  entry={entry}
                  key={entry._id}
                  variant="archive"
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

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
