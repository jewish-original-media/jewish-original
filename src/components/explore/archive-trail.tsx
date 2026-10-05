import Link from "next/link";

import styles from "./archive-trail.module.css";

export type ArchiveTrailRoom =
  "today" | "explore" | "history" | "current" | "news" | "events";

const TRAILS: Record<
  ArchiveTrailRoom,
  ReadonlyArray<{ href: string; label: string; room: ArchiveTrailRoom }>
> = {
  today: [
    { href: "/today", label: "Today", room: "today" },
    { href: "/history", label: "History", room: "history" },
    { href: "/explore", label: "Living archive", room: "explore" },
    { href: "/explore?view=current", label: "Current", room: "current" },
  ],
  explore: [
    { href: "/explore", label: "Living archive", room: "explore" },
    { href: "/history", label: "History", room: "history" },
    { href: "/today", label: "Today", room: "today" },
    { href: "/explore?view=current", label: "Current", room: "current" },
  ],
  history: [
    { href: "/history", label: "History", room: "history" },
    { href: "/explore", label: "Living archive", room: "explore" },
    { href: "/today", label: "Today", room: "today" },
    { href: "/explore?view=current", label: "Current", room: "current" },
  ],
  current: [
    { href: "/explore?view=current", label: "Current", room: "current" },
    { href: "/news", label: "News", room: "news" },
    { href: "/events", label: "Events", room: "events" },
    { href: "/explore", label: "Living archive", room: "explore" },
  ],
  news: [
    { href: "/news", label: "News", room: "news" },
    { href: "/explore?view=current", label: "Current", room: "current" },
    { href: "/events", label: "Events", room: "events" },
    { href: "/explore", label: "Living archive", room: "explore" },
  ],
  events: [
    { href: "/events", label: "Events", room: "events" },
    { href: "/explore?view=current", label: "Current", room: "current" },
    { href: "/news", label: "News", room: "news" },
    { href: "/explore", label: "Living archive", room: "explore" },
  ],
};

export function ArchiveTrail({ current }: { current: ArchiveTrailRoom }) {
  return (
    <nav aria-label="Continue exploring" className={styles.trail}>
      <p className={styles.label}>Continue through the archive</p>
      <ol className={styles.list}>
        {TRAILS[current].map((item, index) => (
          <li key={`${current}-${item.href}`}>
            <Link
              aria-current={item.room === current ? "page" : undefined}
              href={item.href}
            >
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
