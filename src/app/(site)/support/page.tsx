import type { Metadata } from "next";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { MuseumFigure } from "@/components/media/museum-figure";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyAddress } from "@/components/support/copy-address";
import { Container } from "@/components/ui/container";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";
import {
  SUPPORT_MONTHLY_AMOUNTS,
  SUPPORT_MONTHLY_OFFERS,
  supportInquiryMailto,
} from "@/lib/support/inquiry";

import styles from "@/app/editorial.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Support Jewish Original",
  description:
    "Help Jewish Original research, edit, and publish Jewish history, and host original conversations.",
  path: "/support",
});

const writeFallback = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Support Jewish Original")}`;

export default function SupportPage() {
  return (
    <div className={`${styles.page} ${styles.roomSupport}`}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Support", path: "/support" },
        ])}
      />
      <section className={styles.hero}>
        <Container className={styles.supportHero}>
          <div>
            <p className="eyebrow">Support</p>
            <h1 className={styles.title}>
              Help keep this history in the world.
            </h1>
            <p className={styles.lede}>
              Jewish Original is a home for Jewish history, culture, education,
              connection, and identity. Your support helps us research the
              archive, edit with care, publish work people can trust, and host
              original conversations.
            </p>
          </div>
          <div className={styles.supportPortrait}>
            <MuseumFigure
              photo={FOUNDER_PHOTOS.tefillin}
              priority
              sizes="(max-width: 47.98rem) 100vw, (max-width: 63.98rem) 70vw, 38rem"
            />
          </div>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="support-helps">
        <Container size="content">
          <p className="eyebrow">How this helps</p>
          <h2 className={styles.sectionTitle} id="support-helps">
            Support funds the work behind the pages.
          </h2>
          <p className={styles.copy}>
            Historical research takes time. So do fact-checking, editing, rights
            review, and the work of publishing a story so it can stay in public
            view. Support also helps us prepare original conversations,
            including podcast episodes, with the same care.
          </p>
          <p className={styles.copy}>
            Public reading stays free. There is no membership wall and no
            purchased influence over what the archive says. Jewish Original
            Media is a for-profit business. A payment here is not a charitable
            contribution, and we do not treat it as tax deductible.
          </p>
        </Container>
      </section>

      <section className={styles.band} aria-labelledby="support-paths">
        <Container>
          <p className="eyebrow">Choose a path</p>
          <h2 className={styles.sectionTitle} id="support-paths">
            Three ways to take part
          </h2>
          <nav aria-label="Support paths" className={styles.paths}>
            <a className={styles.path} href="#give-once">
              <span className={styles.index} aria-hidden="true">
                01
              </span>
              <h3 className={styles.pathTitle}>Give once</h3>
              <p className={styles.pathCopy}>
                A one-time gift in an amount you choose. No promotional
                benefits.
              </p>
            </a>
            <a className={styles.path} href="#monthly">
              <span className={styles.index} aria-hidden="true">
                02
              </span>
              <h3 className={styles.pathTitle}>Support monthly</h3>
              <p className={styles.pathCopy}>
                A steady monthly contribution. There are no membership perks
                attached.
              </p>
            </a>
            <a className={styles.path} href="#sponsor">
              <span className={styles.index} aria-hidden="true">
                03
              </span>
              <h3 className={styles.pathTitle}>Sponsor or collaborate</h3>
              <p className={styles.pathCopy}>
                A labeled dedication or partnership. Recognition stays separate
                from the history.
              </p>
            </a>
          </nav>
        </Container>
      </section>

      <section
        className={`${styles.chapter} ${styles.supportTarget}`}
        id="give-once"
        aria-labelledby="once-heading"
      >
        <Container size="content">
          <p className="eyebrow">Give once</p>
          <h2 className={styles.sectionTitle} id="once-heading">
            A gift, in your amount
          </h2>
          <p className={styles.copy}>
            Choose any amount that feels right. This is general support. It does
            not buy a placement, a dedication, or editorial coverage.
          </p>
          <p className={styles.actions}>
            <TrackedAnchor
              className="button button--primary"
              event="support_inquiry_compose"
              href={supportInquiryMailto("one-time")}
            >
              Open a one-time support draft
            </TrackedAnchor>
          </p>
          <p className={styles.note}>
            This opens a message in your mail app. It does not send anything.
            Press send when the note is ready.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.chapter} ${styles.monthlyBand} ${styles.supportTarget}`}
        id="monthly"
        aria-labelledby="month-heading"
      >
        <Container size="content">
          <p className="eyebrow">Support monthly</p>
          <h2 className={styles.sectionTitle} id="month-heading">
            A monthly contribution
          </h2>
          <p className={styles.copy}>
            Monthly support helps us plan research, editing, and publishing as
            ongoing work. There are no membership perks attached. These amounts
            are the current public options. We confirm the amount before any
            payment.
          </p>
          <p
            className={styles.amountList}
            role="group"
            aria-label="Monthly amounts"
          >
            {SUPPORT_MONTHLY_AMOUNTS.map((amount) => (
              <TrackedAnchor
                aria-label={`Open an email draft for $${amount} each month`}
                className="button button--secondary"
                event="support_inquiry_compose"
                href={supportInquiryMailto(SUPPORT_MONTHLY_OFFERS[amount])}
                key={amount}
              >
                ${amount} each month
              </TrackedAnchor>
            ))}
          </p>
          <p className={styles.note}>
            Each amount opens an email draft. Nothing is sent until you press
            send.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.chapter} ${styles.supportTarget}`}
        id="sponsor"
        aria-labelledby="sponsor-heading"
      >
        <Container size="content">
          <p className="eyebrow">Sponsor or collaborate</p>
          <h2 className={styles.sectionTitle} id="sponsor-heading">
            Recognition that stays labeled, and separate from the history.
          </h2>
          <p className={styles.copy}>
            Sponsorship is a paid acknowledgment. It does not change historical
            facts, factual review, or editorial decisions. Paid placements stay
            labeled. We do not sell coverage of a story. We confirm availability
            and deliverables before asking for payment.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.chapter} ${styles.featured}`}
        aria-labelledby="support-day"
      >
        <Container size="content">
          <p className="eyebrow">Featured</p>
          <h2 className={styles.sectionTitle} id="support-day">
            Sponsor a Day in Jewish History
          </h2>
          <p className={styles.amount}>$360</p>
          <p className={styles.copy}>
            Dedicate a labeled acknowledgment to a calendar day in the archive.
            The historical event date and the period your sponsorship appears
            are not the same thing. The story itself stays independent. We
            confirm what appears, where, and for how long before any payment.
          </p>
          <p className={styles.actions}>
            <TrackedAnchor
              className="button button--primary"
              event="support_inquiry_compose"
              href={supportInquiryMailto("day-in-jewish-history")}
            >
              Open an email draft about this day
            </TrackedAnchor>
          </p>
          <p className={styles.note}>
            This opens a message in your mail app. It does not send anything.
          </p>
        </Container>
      </section>

      <section
        className={styles.chapter}
        aria-labelledby="support-alternatives"
      >
        <Container size="content">
          <p className="eyebrow">Accessible alternatives</p>
          <h2 className={styles.sectionTitle} id="support-alternatives">
            Social and podcast acknowledgments
          </h2>
          <ul className={styles.possible}>
            <li>
              <strong>Sponsor a social post. $36.</strong> One labeled social
              post, scheduled after we confirm the copy and the date.{" "}
              <TrackedAnchor
                event="support_inquiry_compose"
                href={supportInquiryMailto("social-post")}
              >
                Open an email draft about a social post
              </TrackedAnchor>
            </li>
            <li>
              <strong>Sponsor a podcast episode. $180.</strong> A labeled
              acknowledgment on an agreed episode. Placement and length are
              confirmed before any payment. Host appearances and extra social
              posts are not included.{" "}
              <TrackedAnchor
                event="support_inquiry_compose"
                href={supportInquiryMailto("podcast-episode")}
              >
                Open an email draft about an episode
              </TrackedAnchor>
            </li>
          </ul>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="support-custom">
        <Container size="content">
          <p className="eyebrow">Custom partnerships</p>
          <h2 className={styles.sectionTitle} id="support-custom">
            Larger work, by conversation
          </h2>
          <p className={styles.copy}>
            Original articles, a month-long partnership, and larger custom
            projects are arranged by conversation. We confirm availability,
            deliverables, and timing before any payment is requested.
          </p>
          <p className={styles.actions}>
            <TrackedAnchor
              className="button button--secondary"
              event="support_inquiry_compose"
              href={supportInquiryMailto("custom")}
            >
              Open an email draft about a partnership
            </TrackedAnchor>
          </p>
          <p className={styles.note}>
            Sponsorship is inquiry-led. General support is separate.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.body} ${styles.supportTarget}`}
        id="write"
        aria-labelledby="write-heading"
      >
        <Container size="content">
          <p className="eyebrow">If you would rather write</p>
          <h2 className={styles.sectionTitle} id="write-heading">
            Email is always available.
          </h2>
          <p className={styles.copy}>
            Write to the address below. Opening a mail draft does not send a
            message. Press send in your mail app when the note is ready.
          </p>
          <CopyAddress
            address={siteConfig.email}
            className={styles.address}
            statusClassName={styles.addressStatus}
            valueClassName={styles.addressValue}
          />
          <p className={styles.actions}>
            <TrackedAnchor
              className="button button--secondary"
              event="support_inquiry_compose"
              href={writeFallback}
            >
              Open a general support draft
            </TrackedAnchor>
          </p>
          <p className={styles.independence}>
            Jewish Original Media is a for-profit business. Support and
            sponsorship payments are not charitable contributions.
          </p>
        </Container>
      </section>
    </div>
  );
}
