import type { Metadata } from "next";

import { JomMotif } from "@/components/brand/jom-motif";
import { MuseumFigure } from "@/components/media/museum-figure";
import { Container } from "@/components/ui/container";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";
import { siteConfig } from "@/lib/site";

import styles from "@/app/editorial.module.css";

export const metadata: Metadata = {
  title: "Support Jewish Original",
  description:
    "Stand with Jewish Original Media. Support, sponsor, or partner without leaving the editorial work secondary.",
  alternates: { canonical: "/support" },
};

const donate = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Support Jewish Original")}`;
const sponsor = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Sponsor Jewish Original")}`;
const partner = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Partner with Jewish Original")}`;

export default function SupportPage() {
  return (
    <div className={`${styles.page} ${styles.roomSupport}`}>
      <section className={styles.hero}>
        <div className={styles.roomMotif} aria-hidden="true">
          <JomMotif name="menorah" />
        </div>
        <Container className={styles.supportHero}>
          <div>
            <p className="eyebrow">Support the work</p>
            <h1 className={styles.title}>Stand with us. Build with us.</h1>
            <p className={styles.lede}>
              Help keep Jewish history, culture, and original work in public
              view. Support remains clearly labeled and secondary to the
              editorial record.
            </p>
          </div>
          <div className={styles.supportPortrait}>
            <MuseumFigure
              photo={FOUNDER_PHOTOS.tefillin}
              sizes="(max-width: 47.98rem) 100vw, (max-width: 63.98rem) 70vw, 38rem"
            />
          </div>
        </Container>
      </section>

      <section className={styles.band}>
        <Container className={styles.invitations}>
          <article className={styles.invitation}>
            <p className={styles.index} aria-hidden="true">
              01
            </p>
            <p className="eyebrow">Support our work</p>
            <h2 className={styles.sectionTitle}>Give $18 or more</h2>
            <p className={styles.amount}>One-time or monthly</p>
            <p className={styles.copy}>
              A simple gift keeps the archive, daily utility, and original
              reporting in motion. Hosted payment links will replace this
              contact path when they are ready.
            </p>
            <p className={styles.actions}>
              <a className="button button--primary" href={donate}>
                Email to support
              </a>
            </p>
          </article>

          <article className={styles.invitation}>
            <p className={styles.index} aria-hidden="true">
              02
            </p>
            <p className="eyebrow">Sponsor our work</p>
            <h2 className={styles.sectionTitle}>Amplify Jewish stories</h2>
            <p className={styles.copy}>
              Sponsor a post, newsletter, podcast, project, or period of content
              and receive meaningful recognition across Jewish Original
              channels.
            </p>
            <p className={styles.actions}>
              <a className="button button--secondary" href={sponsor}>
                Email to sponsor
              </a>
            </p>
          </article>

          <article className={styles.invitation}>
            <p className={styles.index} aria-hidden="true">
              03
            </p>
            <p className="eyebrow">Partner with us</p>
            <h2 className={styles.sectionTitle}>Work alongside the mission</h2>
            <p className={styles.copy}>
              We team up with aligned Jewish organizations, brands,
              institutions, and creators to produce meaningful content, grow
              communities, and elevate shared missions online and in person.
            </p>
            <p className={styles.actions}>
              <a className="button button--secondary" href={partner}>
                Email to partner
              </a>
            </p>
          </article>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="support-possible">
        <Container size="content">
          <p className="eyebrow">Patronage</p>
          <h2 className={styles.sectionTitle} id="support-possible">
            What your support makes possible
          </h2>
          <p className={styles.copy}>
            Support helps the work Jewish Original already does in public:
          </p>
          <ul className={styles.possible}>
            <li>research and preserve Jewish history</li>
            <li>maintain the public History archive</li>
            <li>produce The Two Tall Jews Show</li>
            <li>build Jewish Today</li>
            <li>create original Jewish writing and media</li>
            <li>document Jewish culture</li>
            <li>develop educational resources</li>
            <li>keep Jewish Original accessible</li>
          </ul>
        </Container>
      </section>

      <section className={styles.body}>
        <Container size="content">
          <p className={styles.independence}>
            Sponsorship supports Jewish Original Media. It does not determine
            editorial judgment.
          </p>
          <p className={styles.note}>
            Write {siteConfig.email}. There is no checkout on this page, and we
            do not claim tax deductibility.
          </p>
        </Container>
      </section>
    </div>
  );
}
