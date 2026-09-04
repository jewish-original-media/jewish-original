import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

import styles from "./site-chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.footerGrid}>
        <div className={styles.footerIdentity}>
          <BrandLogo placement="footer" />
          <p className={styles.footerLede}>{siteConfig.description}</p>
          <p className={styles.footerLegalName}>{siteConfig.legalName}</p>
          <a className={styles.footerEmail} href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
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
            <p className={styles.footerLabel}>Legal</p>
            <ul className={styles.footerList}>
              {siteConfig.footerUtility.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
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
