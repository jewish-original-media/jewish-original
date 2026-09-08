import Link from "next/link";

import type { JewishTodayDay } from "@/features/jewish-today";
import { calendarHighlights } from "@/lib/jewish-today/display";

import styles from "@/app/home.module.css";

type HomeJewishTodayProps = {
  day: JewishTodayDay;
};

export function HomeJewishToday({ day }: HomeJewishTodayProps) {
  const highlights = calendarHighlights(day).slice(0, 3);
  const history = day.onThisDay[0];
  const hasHebrewObject = Boolean(day.hebrewDay && day.hebrewMonth);

  return (
    <section
      className={`${styles.band} ${styles.today}`}
      aria-labelledby="home-today"
    >
      <div className={styles.bandInner}>
        <p className={`${styles.sectionLabel} eyebrow`}>Jewish Today</p>
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
            {day.parashah ? (
              <p className={styles.parashah}>{day.parashah.title}</p>
            ) : null}
            {highlights.length > 0 ? (
              <ul className={styles.observanceList}>
                {highlights.map((item) => (
                  <li key={item.title}>{item.title}</li>
                ))}
              </ul>
            ) : null}
            {history ? (
              <div className={styles.historyMatch}>
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
