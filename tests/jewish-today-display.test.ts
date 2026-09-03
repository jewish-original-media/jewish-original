import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calendarHighlights,
  firstSentence,
} from "../src/lib/jewish-today/display";

describe("Jewish Today display helpers", () => {
  it("keeps only the first sentence of a long calendar memo", () => {
    assert.equal(
      firstSentence(
        "Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot.",
      ),
      "Passover, the Feast of Unleavened Bread.",
    );
  });

  it("lists calendar highlights and omits empty groups", () => {
    const items = calendarHighlights({
      holidays: [{ title: "Pesach I", memo: "Passover. Extra detail." }],
      observances: [],
      specialShabbat: [],
      omer: { title: "18th day of the Omer", countEnglish: "Today is 18 days" },
    });

    assert.equal(items[0]?.title, "Pesach I");
    assert.equal(items[0]?.memo, "Passover.");
    assert.equal(items[1]?.title, "18th day of the Omer");
  });
});
