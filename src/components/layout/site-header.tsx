import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig, type SiteNavItem } from "@/lib/site";

import styles from "./site-chrome.module.css";

export type SiteHeaderToday = {
  gregorianLabel: string;
  hebrewDate?: string;
};

export function SiteHeader({
  today,
  navigation = siteConfig.navigation,
}: {
  today?: SiteHeaderToday;
  navigation?: readonly SiteNavItem[];
}) {
  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <div className={styles.headerDate}>
          {today ? (
            <>
              <span>{today.gregorianLabel}</span>
              {today.hebrewDate ? <span>{today.hebrewDate}</span> : null}
            </>
          ) : (
            <span>The living Jewish story</span>
          )}
        </div>

        <div className={styles.headerLogo}>
          <BrandLogo priority />
        </div>

        <div className={styles.headerActions}>
          <Link className={styles.quickLink} href="/podcasts">
            Listen
          </Link>
          <Link
            className={`${styles.quickLink} ${styles.support}`}
            href="/support"
          >
            Support
          </Link>
          <details className={styles.menu}>
            <summary className={styles.menuToggle}>
              <span>Menu</span>
              <span aria-hidden="true" className={styles.menuIcon} />
            </summary>
            <nav className={styles.menuPanel} aria-label="Mobile">
              {today ? (
                <p className={styles.menuDate}>
                  {today.hebrewDate ? `${today.hebrewDate} · ` : ""}
                  {today.gregorianLabel}
                </p>
              ) : null}
              <p className={styles.menuIntroduction}>
                The Jewish past is not behind us. It moves through what we
                learn, make, question, and carry forward.
              </p>
              <ul className={styles.menuList}>
                {navigation.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      className={`${styles.menuLink} ${"emphasis" in item && item.emphasis ? styles.support : ""}`.trim()}
                      href={item.href}
                    >
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item.label}</span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
