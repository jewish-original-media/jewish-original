import type { PublicEventCard } from "@/content/events/types";
import { eventDateParts, eventPlaceLabel } from "@/lib/events/display";

import styles from "@/app/home.module.css";

type HomeEventsProps = {
  items: PublicEventCard[];
};

export function HomeEvents({ items }: HomeEventsProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`${styles.band} ${styles.events}`}
      aria-label="Upcoming events"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>Upcoming events</p>
        <h2 className={styles.eventsTitle}>On the calendar.</h2>
        <ol className={styles.eventList}>
          {items.map((item) => {
            const date = eventDateParts(item.startAt, item.timezone);
            return (
              <li key={item.id} className={styles.eventItem}>
                <div className={styles.eventDate} aria-hidden="true">
                  <div className={styles.eventMonth}>{date.month}</div>
                  <div className={styles.eventDay}>{date.day}</div>
                </div>
                <a
                  className={styles.eventLink}
                  href={item.eventUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className={styles.eventTitle}>{item.title}</span>
                  <span className={styles.eventMeta}>
                    {item.organizer} · {eventPlaceLabel(item)}
                  </span>
                  {item.jomContext ? (
                    <span className={styles.eventContext}>
                      {item.jomContext}
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
