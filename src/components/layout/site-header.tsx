import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig, type SiteNavItem } from "@/lib/site";

import { menuTone } from "./menu-tone";
import { NavigationChild, PrimaryNav } from "./primary-nav";
import styles from "./site-chrome.module.css";

export type SiteHeaderToday = {
  gregorianLabel: string;
  hebrewDate?: string;
};

export type SiteRibbonItem = {
  eyebrow: string;
  label: string;
  href: string;
  external?: boolean;
  analyticsEvent?: string;
};

export function SiteHeader({
  today,
  navigation = siteConfig.navigation,
  ribbon = [],
}: {
  today?: SiteHeaderToday;
  navigation?: readonly SiteNavItem[];
  ribbon?: readonly SiteRibbonItem[];
}) {
  const desktopNavigation = navigation.filter(
    (item) => item.href !== "/podcasts" && item.href !== "/support",
  );

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
                  <li data-menu={menuTone(item.href)} key={item.href}>
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
                    {item.children?.length ? (
                      <ul
                        aria-label={`${item.label} sections`}
                        className={styles.menuChildren}
                      >
                        {item.children.map((child) => (
                          <li key={`${child.href}-${child.label}`}>
                            <NavigationChild child={child} />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </Container>
      <PrimaryNav items={desktopNavigation} />
      {ribbon.length ? (
        <nav
          className={styles.dailyRibbon}
          aria-label="The day across Jewish Original"
        >
          <p className={styles.dailyRibbonLabel}>The day, connected</p>
          <ol className={styles.dailyRibbonList}>
            {ribbon.map((item) => (
              <li key={`${item.eyebrow}-${item.href}`}>
                {item.external ? (
                  <TrackedAnchor
                    event={item.analyticsEvent ?? "daily_ribbon_outbound"}
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>{item.eyebrow}</span>
                    <strong>{item.label}</strong>
                    <span aria-hidden="true">↗</span>
                  </TrackedAnchor>
                ) : (
                  <Link href={item.href}>
                    <span>{item.eyebrow}</span>
                    <strong>{item.label}</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </header>
  );
}
