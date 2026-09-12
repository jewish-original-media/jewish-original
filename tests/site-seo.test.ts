import assert from "node:assert/strict";
import test from "node:test";

import {
  breadcrumbJsonLd,
  newsCollectionJsonLd,
  organizationJsonLd,
  publicStaticSitemapPaths,
  websiteJsonLd,
} from "../src/lib/seo/site";
import { siteConfig } from "../src/lib/site";

test("lists only launch-ready static sitemap paths", () => {
  const paths = publicStaticSitemapPaths();
  assert.deepEqual(paths, [
    "/",
    "/today",
    "/history",
    "/podcasts",
    "/news",
    "/about",
    "/support",
    "/privacy",
  ]);
  assert.equal(paths.includes("/events"), false);
  assert.equal(paths.includes("/admin"), false);
});

test("builds Organization and WebSite JSON-LD without a search action", () => {
  const organization = organizationJsonLd();
  const website = websiteJsonLd();
  assert.equal(organization["@type"], "Organization");
  assert.equal(organization.name, "Jewish Original Media");
  assert.equal(website["@type"], "WebSite");
  assert.equal("potentialAction" in website, false);
});

test("builds News as a CollectionPage, not article copies", () => {
  const jsonLd = newsCollectionJsonLd();
  assert.equal(jsonLd["@type"], "CollectionPage");
  assert.match(jsonLd.description, /outbound/);
});

test("builds breadcrumbs from public paths", () => {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "News", path: "/news" },
  ]);
  const [home, news] = jsonLd.itemListElement;
  assert.equal(home?.item, siteConfig.url);
  assert.equal(news?.item, `${siteConfig.url}/news`);
});
