import Link from "next/link";

import type { JewishTodayDay } from "@/features/jewish-today";
import { formatGregorianLabel } from "@/features/jewish-today/timezone";
import {
  calendarHighlights,
  firstSentence,
  formatParashahDisplayTitle,
  sefariaPassageHref,
  torahReadingContext,
  torahPortionLabel,
} from "@/lib/jewish-today/display";

import styles from "@/app/home.module.css";

type HomeJewishTodayProps = {
  day: JewishTodayDay;
};

export function HomeJewishToday({ day }: HomeJewishTodayProps) {
  const highlights = calendarHighlights(day).slice(0, 3);
  const history = day.onThisDay[0];
  const hasHebrewObject = Boolean(day.hebrewDay && day.hebrewMonth);
  const parashahTitle = formatParashahDisplayTitle(day.parashah?.title);

  return (
    <section
      className={`${styles.band} ${styles.today}`}
      aria-labelledby="home-today"
    >
      <div className={styles.bandInner}>
        <header className={styles.todayHeader}>
          <p className={`${styles.sectionLabel} eyebrow`}>Jewish Today</p>
          <p className={styles.todayIntroduction}>
            The Jewish calendar is not behind us. It is happening now.
          </p>
        </header>
        <div className={styles.todayObject}>
          <div className={styles.todayDate}>
            {hasHebrewObject ? (
              <>
                <h2 className={styles.hebrewNumeral} id="home-today">
                  {day.hebrewDay}
                  <span className="sr-only">
                    {` ${day.hebrewMonth}${day.hebrewYear ? ` ${day.hebrewYear}` : ""}`}
                  </span>
                </h2>
                <p className={styles.hebrewMonth} aria-hidden="true">
                  {day.hebrewMonth}
                  {day.hebrewYear ? (
                    <span className={styles.hebrewYear}>{day.hebrewYear}</span>
                  ) : null}
                </p>
              </>
            ) : (
              <h2 className={styles.hebrewMonth} id="home-today">
                {day.hebrewDate ?? day.gregorianLabel}
              </h2>
            )}
            {day.hebrewDateHebrew ? (
              <p className={styles.hebrewScript} lang="he" dir="rtl">
                {day.hebrewDateHebrew}
              </p>
            ) : null}
          </div>

          <div className={styles.todayContext}>
            <p className={styles.civilDate}>{day.gregorianLabel}</p>
            <p className={styles.todayPlace}>Eastern Time</p>

            {day.festivalShabbat ? (
              <div className={styles.todayFact}>
                <p className={styles.sectionLabel}>Festival</p>
                <p className={styles.parashah}>{day.festivalShabbat.title}</p>
                {day.festivalShabbat.titleHebrew ? (
                  <p className={styles.parashahHebrew} lang="he" dir="rtl">
                    {day.festivalShabbat.titleHebrew}
                  </p>
                ) : null}
                <p className={styles.todayFactNote}>
                  {`Read ${formatGregorianLabel(day.festivalShabbat.observedOn)}`}
                </p>
                {firstSentence(day.festivalShabbat.memo, 180) ? (
                  <p className={styles.todayKnowledge}>
                    {firstSentence(day.festivalShabbat.memo, 180)}
                  </p>
                ) : null}
                {day.festivalShabbat.torahReadings[0] ? (
                  <a
                    className={styles.todayStudyLink}
                    href={sefariaPassageHref(
                      day.festivalShabbat.torahReadings[0],
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Study {day.festivalShabbat.torahReadings[0]} on Sefaria
                  </a>
                ) : null}
              </div>
            ) : null}

            {parashahTitle && day.parashah ? (
              <div className={styles.todayFact}>
                <p className={styles.sectionLabel}>
                  {torahPortionLabel(day.parashah.readingKind)}
                </p>
                <p className={styles.parashah}>{parashahTitle}</p>
                {day.parashah.titleHebrew ? (
                  <p className={styles.parashahHebrew} lang="he" dir="rtl">
                    {day.parashah.titleHebrew}
                  </p>
                ) : null}
                <p className={styles.todayFactNote}>
                  {day.parashah.observedOn === day.gregorianDate
                    ? "Read this Shabbat"
                    : `Read ${formatGregorianLabel(day.parashah.observedOn)}`}
                </p>
                {firstSentence(day.parashah.memo, 180) ? (
                  <p className={styles.todayKnowledge}>
                    {firstSentence(day.parashah.memo, 180)}
                  </p>
                ) : torahReadingContext(day.parashah.torahReadings) ? (
                  <p className={styles.todayKnowledge}>
                    {torahReadingContext(day.parashah.torahReadings)}
                  </p>
                ) : null}
                {day.parashah.torahReadings[0] ? (
                  <a
                    className={styles.todayStudyLink}
                    href={sefariaPassageHref(day.parashah.torahReadings[0])}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Study {day.parashah.torahReadings[0]} on Sefaria
                  </a>
                ) : null}
              </div>
            ) : null}

            {highlights.length > 0 ? (
              <div className={styles.todayFact}>
                <p className={styles.sectionLabel}>Today</p>
                <ul className={styles.observanceList}>
                  {highlights.map((item) => (
                    <li key={item.title}>
                      <span>{item.title}</span>
                      {item.memo ? (
                        <small className={styles.observanceMemo}>
                          {item.memo}
                        </small>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {history ? (
              <div className={styles.todayFact}>
                <p className={styles.sectionLabel}>On this day</p>
                <p className={styles.historyMatchTitle}>
                  <Link href={`/history/${history.slug}`}>{history.title}</Link>
                </p>
              </div>
            ) : null}

            {day.calendarStatus === "unavailable" ? (
              <p className={styles.unavailableNote}>
                Hebrew calendar details are briefly unavailable.
              </p>
            ) : null}
            <p className={styles.todayPath}>
              <Link className="editorial-link" href="/today">
                Today
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
