import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
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
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container size="content">
          <p className="eyebrow">Support</p>
          <h1 className={styles.title}>Stand with us. Build with us.</h1>
          <p className={styles.lede}>
            Help keep Jewish history, culture, and original work in public view.
            Support remains clearly labeled and secondary to the editorial
            record.
          </p>
        </Container>
      </section>

      <section className={styles.band}>
        <Container className={styles.grid}>
          <div>
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
          </div>

          <div>
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
          </div>
        </Container>
      </section>

      <section className={styles.body}>
        <Container size="content">
          <p className="eyebrow">Partner with us</p>
          <h2 className={styles.sectionTitle}>Work alongside the mission</h2>
          <p className={styles.copy}>
            We team up with aligned Jewish organizations, brands, institutions,
            and creators to produce meaningful content, grow communities, and
            elevate shared missions online and in person.
          </p>
          <p className={styles.actions}>
            <a className="button button--secondary" href={partner}>
              Email to partner
            </a>
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
