import assert from "node:assert/strict";
import test from "node:test";

import { extractOpenGraphImage } from "../src/content/news/source-image";

const page = "https://www.jta.org/2026/09/20/example";

test("reads the publisher Open Graph image without storing it", () => {
  const html = `
    <html><head>
      <meta content="https://www.jta.org/wp-content/uploads/2026/09/FBI-260920.jpeg" property="og:image" />
    </head><body></body></html>
  `;

  assert.equal(
    extractOpenGraphImage(html, page),
    "https://www.jta.org/wp-content/uploads/2026/09/FBI-260920.jpeg",
  );
});

test("prefers a secure image and resolves publisher-relative URLs", () => {
  const html = `
    <head>
      <meta property="og:image" content="http://cdn.example/insecure.jpg" />
      <meta property="og:image:secure_url" content="/photos/lead.webp" />
      <meta name="twitter:image" content="https://cdn.example/later.jpg" />
    </head>
  `;

  assert.equal(
    extractOpenGraphImage(html, "https://publisher.example/story"),
    "https://publisher.example/photos/lead.webp",
  );
});

test("decodes image URLs and ignores unsafe targets", () => {
  const html = `
    <head>
      <meta property="og:image" content="javascript:alert(1)" />
      <meta name="twitter:image" content="//images.example/a.jpg?src=one&amp;w=1200" />
    </head>
  `;

  assert.equal(
    extractOpenGraphImage(html, page),
    "https://images.example/a.jpg?src=one&w=1200",
  );
});
