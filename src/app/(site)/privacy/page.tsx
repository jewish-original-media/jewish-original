import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

import styles from "@/app/editorial.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy",
  description:
    "How Jewish Original Media currently treats public-site analytics, cookies, and contact.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className={`${styles.page} ${styles.roomPrivacy}`}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <section className={styles.hero}>
        <Container size="content">
          <p className="eyebrow">Privacy</p>
          <h1 className={styles.title}>What this site does now</h1>
          <p className={styles.lede}>
            This page describes current public product behavior. It is not a
            finished legal policy.
          </p>
        </Container>
      </section>

      <section className={styles.body}>
        <Container className={styles.stack} size="content">
          <div>
            <h2 className={styles.sectionTitle}>No marketing stack</h2>
            <p className={styles.copy}>
              The public site does not use marketing cookies, an advertising
              network, or a member account system. There is no public form
              infrastructure beyond future hosted payment links.
            </p>
          </div>
          <div>
            <h2 className={styles.sectionTitle}>First-party analytics</h2>
            <p className={styles.copy}>
              The public site uses Vercel Web Analytics and Speed Insights to
              understand traffic and page performance. Those tools are
              first-party and cookieless. There is no advertising pixel and no
              cookie banner for analytics.
            </p>
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <p className={styles.copy}>
              Questions can be sent to{" "}
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. The
              legal name of the publisher is {siteConfig.legalName}.
            </p>
          </div>
          <p className={styles.review} role="note">
            Founder review required before this page is treated as a binding
            privacy policy.
          </p>
        </Container>
      </section>
    </div>
  );
}
