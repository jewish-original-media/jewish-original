import Link from "next/link";

import type { JewishTodayDay } from "@/features/jewish-today";
import { calendarHighlights } from "@/lib/jewish-today/display";

import styles from "@/app/home.module.css";

type HomeJewishTodayProps = {
  day: JewishTodayDay;
};

export function HomeJewishToday({ day }: HomeJewishTodayProps) {
  const highlights = calendarHighlights(day).slice(0, 2);
  const history = day.onThisDay[0];

  return (
    <section className={styles.todaySection} aria-labelledby="home-today">
      <div className={styles.todayGrid}>
        <div>
          <p className="eyebrow">Jewish Today</p>
          <h2 className={styles.todayTitle} id="home-today">
            {day.hebrewDate ?? day.gregorianLabel}
          </h2>
          {day.hebrewDateHebrew ? (
            <p className={styles.todayHebrew} lang="he" dir="rtl">
              {day.hebrewDateHebrew}
            </p>
          ) : null}
        </div>

        <div className={styles.todayContext}>
          <p className={styles.todayCivil}>{day.gregorianLabel}</p>
          {day.parashah ? (
            <p className={styles.todayMeta}>
              <span className={styles.todayLabel}>Parashah</span>
              {day.parashah.title}
            </p>
          ) : null}
          {highlights.map((item) => (
            <p className={styles.todayMeta} key={item.title}>
              <span className={styles.todayLabel}>Now</span>
              {item.title}
            </p>
          ))}
          {history ? (
            <p className={styles.todayMeta}>
              <span className={styles.todayLabel}>On this day</span>
              <Link href={`/history/${history.slug}`}>{history.title}</Link>
            </p>
          ) : null}
          {day.calendarStatus === "unavailable" ? (
            <p className={styles.todayMeta}>
              Hebrew calendar details are briefly unavailable.
            </p>
          ) : null}
          <p className={styles.todayLink}>
            <Link href="/today">Open Jewish Today</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
