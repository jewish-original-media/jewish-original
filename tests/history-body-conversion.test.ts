import assert from "node:assert/strict";
import test from "node:test";

import {
  convertSourceBody,
  reconstructSourceBody,
} from "../src/lib/history/source-body";

const samples = [
  "One paragraph with a trailing space. ",
  "First paragraph.\n\nSecond paragraph.",
  "First paragraph.\r\n \r\nSecond paragraph with https://example.org/a?b=1.",
  "\n\nLeading source whitespace stays intact.\n\nA second paragraph.\n\n",
  "A URL remains literal: https://example.org/path.\nA single line break is not rewritten.",
  "",
];

for (const source of samples) {
  test(`reconstructs ${JSON.stringify(source.slice(0, 36))}`, () => {
    const conversion = convertSourceBody(source);
    assert.equal(
      reconstructSourceBody(conversion.blocks, conversion.separators),
      source,
    );
  });
}

test("creates deterministic paragraph blocks and keys", () => {
  const source = "First.\n\nSecond.\n\nThird.";
  assert.deepEqual(convertSourceBody(source), convertSourceBody(source));
  assert.equal(convertSourceBody(source).blocks.length, 3);
});

test("rejects incomplete separator metadata", () => {
  const conversion = convertSourceBody("First.\n\nSecond.");
  assert.throws(
    () => reconstructSourceBody(conversion.blocks, []),
    /require 1 separators/,
  );
});
