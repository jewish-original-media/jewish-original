import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { Container } from "@/components/ui/container";
import { siteConfig, siteSocial, type SiteNavItem } from "@/lib/site";

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
          <p className={styles.footerMark}>Am Yisrael Chai</p>
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
                <TrackedAnchor
                  event={siteSocial[0].analyticsEvent}
                  href={siteSocial[0].href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram
                  <span className="sr-only">, {siteSocial[0].account}</span>
                </TrackedAnchor>
              </li>
              <li>
                <a className={styles.footerMail} href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email.slice(0, siteConfig.email.indexOf("@") + 1)}
                  <wbr />
                  {siteConfig.email.slice(siteConfig.email.indexOf("@") + 1)}
                </a>
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
