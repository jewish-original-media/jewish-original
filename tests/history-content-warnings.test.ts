import assert from "node:assert/strict";
import test from "node:test";

import { formatContentWarningList } from "../src/lib/history/content-warnings";

test("does not repeat death when genocide is already listed", () => {
  assert.equal(
    formatContentWarningList(["antisemiticViolence", "genocide", "death"]),
    "antisemitic violence, genocide or mass death",
  );
});

test("keeps death when it is the only mortality warning", () => {
  assert.equal(formatContentWarningList(["death"]), "death");
});
