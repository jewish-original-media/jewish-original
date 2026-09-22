import Link from "next/link";

import type { JewishTodayDay } from "@/features/jewish-today";

import styles from "@/app/today/today.module.css";

type JewishTodayModuleProps = {
  day: JewishTodayDay;
};

export function JewishTodayModule({ day }: JewishTodayModuleProps) {
  const calendarLine =
    day.holidays[0]?.title ??
    day.roshChodesh?.title ??
    day.specialShabbat[0]?.title ??
    day.observances[0]?.title ??
    day.omer?.title;
  const history = day.onThisDay[0];

  return (
    <section className={styles.module} aria-labelledby="jewish-today-module">
      <p className="eyebrow">Jewish Today</p>
      <h2 className={styles.moduleTitle} id="jewish-today-module">
        {day.hebrewDate ?? day.gregorianLabel}
      </h2>
      {day.hebrewDateHebrew ? (
        <p className={styles.moduleHebrew} lang="he" dir="rtl">
          {day.hebrewDateHebrew}
        </p>
      ) : null}
      {calendarLine ? (
        <p className={styles.moduleMeta}>{calendarLine}</p>
      ) : null}
      {day.parashah && !calendarLine ? (
        <p className={styles.moduleMeta}>{day.parashah.title}</p>
      ) : null}
      {history ? (
        <p className={styles.moduleMeta}>On this day: {history.title}</p>
      ) : null}
      {day.calendarStatus === "unavailable" ? (
        <p className={styles.moduleMeta}>
          Hebrew calendar details are briefly unavailable.
        </p>
      ) : null}
      <p className={styles.moduleLink}>
        <Link href="/today">Open Jewish Today</Link>
      </p>
    </section>
  );
}
