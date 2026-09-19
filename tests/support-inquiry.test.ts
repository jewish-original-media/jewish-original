import assert from "node:assert/strict";
import test from "node:test";

import {
  SUPPORT_MONTHLY_AMOUNTS,
  SUPPORT_MONTHLY_STATUS,
  supportInquiryMailto,
} from "../src/lib/support/inquiry";

test("keeps monthly amounts proposed until the founder confirms them", () => {
  assert.equal(SUPPORT_MONTHLY_STATUS, "proposed");
  assert.deepEqual([...SUPPORT_MONTHLY_AMOUNTS], [18, 36, 72]);
});

test("encodes inquiry mailtos without claiming a send", () => {
  const href = supportInquiryMailto("day-in-jewish-history");
  const url = new URL(href);

  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "hello@jewishoriginal.com");
  assert.equal(
    url.searchParams.get("subject"),
    "Jewish Original support: Sponsor a Day in Jewish History, $360",
  );

  const body = url.searchParams.get("body") || "";
  assert.match(body, /^Offer: Sponsor a Day in Jewish History, \$360/m);
  assert.match(body, /^Preferred date or episode:$/m);
  assert.match(body, /^Name:$/m);
  assert.match(body, /^Email:$/m);
  assert.match(body, /^Dedication or business:$/m);
  assert.match(body, /^A brief message:$/m);
  assert.match(body, /Opening this draft does not send a message/);
  assert.match(
    body,
    /We will confirm availability and deliverables before asking for payment/,
  );
  assert.equal(href.includes("\n"), false);
  assert.equal(href.includes(" "), false);
});
