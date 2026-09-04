import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

import styles from "./site-chrome.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <BrandLogo priority />

        <nav className={styles.primaryNav} aria-label="Primary">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              className={`${styles.navLink} ${"emphasis" in item && item.emphasis ? styles.support : ""}`.trim()}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.mobile}>
          <details className={styles.menu}>
            <summary className={styles.menuToggle}>
              <span>Menu</span>
              <span aria-hidden="true" className={styles.menuIcon} />
            </summary>
            <nav className={styles.menuPanel} aria-label="Mobile">
              <ul className={styles.menuList}>
                {siteConfig.navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      className={`${styles.menuLink} ${"emphasis" in item && item.emphasis ? styles.support : ""}`.trim()}
                      href={item.href}
                    >
                      {item.label}
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
