import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import type { PublicEventCard } from "@/content/events/types";
import { eventDateParts, eventPlaceLabel } from "@/lib/events/display";
import { firstSentence } from "@/lib/jewish-today/display";

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
        <p className={styles.eventsIntroduction}>
          Official programs from Jewish organizations, kept in each event’s own
          place and timezone.
        </p>
        <ol className={styles.eventList}>
          {items.map((item) => {
            const date = eventDateParts(item.startAt, item.timezone);
            return (
              <li key={item.id} className={styles.eventItem}>
                <div className={styles.eventDate} aria-hidden="true">
                  <div className={styles.eventMonth}>{date.month}</div>
                  <div className={styles.eventDay}>{date.day}</div>
                </div>
                <TrackedAnchor
                  className={styles.eventLink}
                  event="event_outbound"
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
                      {firstSentence(item.jomContext, 160)}
                    </span>
                  ) : null}
                  <span className={styles.newsSource}>
                    Open official event page
                  </span>
                </TrackedAnchor>
              </li>
            );
          })}
        </ol>
        <p className={styles.eventPaths}>
          <Link className={styles.newsDeskLink} href="/events">
            Full calendar
          </Link>
          <span aria-hidden="true"> · </span>
          <Link className={styles.newsDeskLink} href="/explore?view=current">
            News and events
          </Link>
        </p>
      </div>
    </section>
  );
}
