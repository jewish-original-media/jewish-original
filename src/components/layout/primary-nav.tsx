"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { Container } from "@/components/ui/container";
import type { SiteNavChild, SiteNavItem } from "@/lib/site";

import { menuTone } from "./menu-tone";
import styles from "./site-chrome.module.css";

export function NavigationChild({ child }: { child: SiteNavChild }) {
  const body = (
    <>
      <span>{child.label}</span>
      {child.description ? <small>{child.description}</small> : null}
      {child.external ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </>
  );

  if (child.external) {
    return (
      <TrackedAnchor
        event={child.analyticsEvent ?? "nav_outbound"}
        href={child.href}
        rel="noreferrer"
        target="_blank"
      >
        {body}
      </TrackedAnchor>
    );
  }

  return <Link href={child.href}>{body}</Link>;
}

function PrimaryNavItem({ item }: { item: SiteNavItem }) {
  const itemRef = useRef<HTMLLIElement>(null);

  return (
    <li
      className={styles.primaryNavItem}
      data-menu={menuTone(item.href)}
      onMouseLeave={() => {
        const root = itemRef.current;
        const active = document.activeElement;
        if (root && active instanceof HTMLElement && root.contains(active)) {
          active.blur();
        }
      }}
      ref={itemRef}
    >
      <Link className={styles.navLink} href={item.href}>
        {item.label}
      </Link>
      {item.children?.length ? (
        <div className={styles.megaPanel}>
          <p className={styles.megaKicker}>{item.menuKicker ?? item.label}</p>
          {item.menuIntroduction ? (
            <p className={styles.megaIntroduction}>{item.menuIntroduction}</p>
          ) : null}
          <ul>
            {item.children.map((child) => (
              <li key={`${child.href}-${child.label}`}>
                <NavigationChild child={child} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function useStickyHeaderOffset() {
  useLayoutEffect(() => {
    const header = document.querySelector("[data-site-header]");
    if (!(header instanceof HTMLElement)) return;
    const menu = header.querySelector("details");
    const root = document.documentElement;
    const body = document.body;
    let rootOverflow = root.style.overflow;
    let bodyOverflow = body.style.overflow;
    let scrollLocked = false;

    const apply = () => {
      root.style.setProperty("--sticky-header", `${header.offsetHeight}px`);
    };

    const syncScrollLock = () => {
      if (menu?.open && !scrollLocked) {
        rootOverflow = root.style.overflow;
        bodyOverflow = body.style.overflow;
        root.style.overflow = "hidden";
        body.style.overflow = "hidden";
        scrollLocked = true;
      } else if (!menu?.open && scrollLocked) {
        root.style.overflow = rootOverflow;
        body.style.overflow = bodyOverflow;
        scrollLocked = false;
      }
    };

    const closeMenu = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("header details a")) return;
      requestAnimationFrame(() => {
        header.querySelector("details")?.removeAttribute("open");
      });
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    window.addEventListener("resize", apply);
    header.addEventListener("click", closeMenu);
    menu?.addEventListener("toggle", syncScrollLock);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      header.removeEventListener("click", closeMenu);
      menu?.removeEventListener("toggle", syncScrollLock);
      if (scrollLocked) {
        root.style.overflow = rootOverflow;
        body.style.overflow = bodyOverflow;
      }
      root.style.removeProperty("--sticky-header");
    };
  }, []);
}

export function PrimaryNav({ items }: { items: readonly SiteNavItem[] }) {
  useStickyHeaderOffset();

  return (
    <nav aria-label="Primary" className={styles.primaryNav}>
      <Container>
        <ul className={styles.primaryNavList}>
          {items.map((item) => (
            <PrimaryNavItem item={item} key={item.href} />
          ))}
        </ul>
      </Container>
    </nav>
  );
}
