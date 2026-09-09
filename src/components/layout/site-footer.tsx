import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

import styles from "./site-chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerGrid}>
        <div className={styles.footerIdentity}>
          <p className={styles.footerMark} aria-hidden="true">
            Jewish
            <br />
            Original
          </p>
          <p className="sr-only">{siteConfig.name}</p>
          <p className={styles.footerLede}>{siteConfig.description}</p>
          <p className={styles.footerSignoff}>
            For memory. For identity. For what comes next.
          </p>
        </div>

        <div className={styles.footerColumns}>
          <div>
            <p className={styles.footerLabel}>Explore</p>
            <ul className={styles.footerList}>
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.footerLabel}>The house</p>
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
          <p>History first. Identity as the work.</p>
        </Container>
      </div>
    </footer>
  );
}
