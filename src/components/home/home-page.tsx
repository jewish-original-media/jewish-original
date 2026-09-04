import { JewishTodayModule } from "@/components/today/jewish-today-module";
import { Container } from "@/components/ui/container";
import { LATER_DESKS, type HomePageData } from "@/features/homepage";

import styles from "@/app/home.module.css";

type HomePageViewProps = {
  data: HomePageData;
};

function HomeSection({
  id,
  eyebrow,
  title,
  className = "",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      className={`${styles.section} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <Container>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={styles.sectionTitle} id={headingId}>
          {title}
        </h2>
        {children}
      </Container>
    </section>
  );
}

export function HomePageView({ data }: HomePageViewProps) {
  return (
    <div className={styles.page}>
      <section className={styles.masthead} aria-labelledby="home-masthead">
        <div className={styles.mastheadRule} aria-hidden="true" />
        <Container>
          <p className="eyebrow">Jewish Original Media</p>
          <h1 className="display-title" id="home-masthead">
            A modern home for Jewish history, culture, education, connection,
            and identity.
          </h1>
          <p className="editorial-lede">
            An editorial publication and daily Jewish utility. History is the
            foundation. Education transmits it. Identity is the product.
            Connection is the outcome.
          </p>
          <p className={styles.principle}>
            Start with today. History, podcasts, and later desks will join this
            home as each collection is ready — never as invented filler.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.section} ${styles.todaySection}`}
        aria-label="Jewish Today"
      >
        <Container>
          <JewishTodayModule day={data.jewishToday} />
        </Container>
      </section>

      <HomeSection
        className={`${styles.sectionRule} ${styles.pendingSection}`}
        eyebrow="History"
        id="history"
        title="The archive belongs here"
      >
        <p className={styles.slotCopy}>
          The History archive will occupy this section. Until the archive
          experience is connected, Jewish Today shows a published on-this-day
          match when one exists and stays quiet when none does.
        </p>
      </HomeSection>

      <HomeSection
        className={styles.pendingSection}
        eyebrow="Podcasts"
        id="podcasts"
        title="Shows and episodes belong here"
      >
        <p className={styles.slotCopy}>
          Featured and recent episodes, show details, episode cards, and media
          links will occupy this section. No episode is invented here.
        </p>
      </HomeSection>

      <HomeSection
        className={styles.sectionRule}
        eyebrow="Later desks"
        id="later-desks"
        title="News, events, culture, and support"
      >
        <p className={styles.laterNote}>
          These desks are reserved. They will join this home when they have
          reviewed content.
        </p>
        <ul className={styles.laterList}>
          {LATER_DESKS.map((desk) => (
            <li className={styles.laterItem} key={desk.id}>
              <p className={styles.laterTitle}>{desk.title}</p>
              <p className={styles.swapItem}>{desk.note}</p>
            </li>
          ))}
        </ul>
      </HomeSection>
    </div>
  );
}
