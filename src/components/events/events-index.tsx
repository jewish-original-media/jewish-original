import { Container } from "@/components/ui/container";
import type { PublicEventCard } from "@/content/events/types";
import { eventDateParts, eventPlaceLabel } from "@/lib/events/display";

import styles from "@/app/events.module.css";

type EventsIndexProps = {
  items: PublicEventCard[];
};

export function EventsIndex({ items }: EventsIndexProps) {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <p className="eyebrow">Events</p>
          <h1 className={styles.title}>Upcoming events</h1>
          <p className={styles.lede}>
            A museum calendar of official Jewish programs. Times stay in each
            event’s own timezone.
          </p>
        </Container>
      </section>
      <section className="section">
        <Container>
          {items.length === 0 ? (
            <p className={styles.empty}>
              No upcoming events are published yet. This calendar stays empty
              until official ICS or JOM-owned records pass review.
            </p>
          ) : (
            <ol className={styles.list}>
              {items.map((item) => {
                const date = eventDateParts(item.startAt, item.timezone);
                return (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.date} aria-hidden="true">
                      <span className={styles.month}>{date.month}</span>
                      <span className={styles.day}>{date.day}</span>
                    </div>
                    <div className={styles.body}>
                      <h2 className={styles.eventTitle}>{item.title}</h2>
                      <p className={styles.organizer}>{item.organizer}</p>
                      <p className={styles.place}>{eventPlaceLabel(item)}</p>
                      <p className={styles.time}>
                        {date.time} {item.timezone}
                      </p>
                      {item.jomContext ? (
                        <p className={styles.context}>{item.jomContext}</p>
                      ) : null}
                      <a
                        className={styles.link}
                        href={item.eventUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View event ↗
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Container>
      </section>
    </div>
  );
}
