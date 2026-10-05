import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig, type SiteNavItem } from "@/lib/site";

import styles from "./site-chrome.module.css";

export function SiteFooter({
  explore = siteConfig.footerExplore,
}: {
  explore?: readonly SiteNavItem[];
}) {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerGrid}>
        <div className={styles.footerIdentity}>
          <p className={styles.footerKicker}>Jewish Original Media</p>
          <p className={styles.footerMark}>Keep the story moving.</p>
          <p className={styles.footerLede}>{siteConfig.description}</p>
          <p className={styles.footerContinuum}>
            Past <span aria-hidden="true">↗</span> Present{" "}
            <span aria-hidden="true">↗</span> What comes next
          </p>
          <Link className={styles.footerSupport} href="/support">
            Support the work <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className={styles.footerColumns}>
          <div>
            <p className={styles.footerLabel}>Explore</p>
            <ul className={styles.footerList}>
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.footerLabel}>Connect</p>
            <ul className={styles.footerList}>
              <li>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              {siteConfig.footerUtility.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <span className={styles.footerLegalName}>
                  {siteConfig.legalName}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className={styles.footerBar}>
        <Container className={styles.footerMeta}>
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>
          <p>For memory. For identity. For what comes next.</p>
        </Container>
      </div>
    </footer>
  );
}
