import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifyTorahReadingKind,
  mapHebcalDay,
  parseHdate,
  selectFestivalShabbat,
  selectUpcomingParashahItem,
} from "../src/integrations/hebcal/map-day";
import type { HebcalCalendarResponse } from "../src/integrations/hebcal/types";

const fixtures = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/hebcal",
);

function load(name: string): HebcalCalendarResponse {
  return JSON.parse(
    readFileSync(join(fixtures, name), "utf8"),
  ) as HebcalCalendarResponse;
}

describe("Hebcal day mapping", () => {
  it("maps an ordinary weekday and the upcoming parashah", () => {
    const day = mapHebcalDay(
      "2026-09-01",
      "America/New_York",
      load("weekday-2026-09-01.json"),
    );

    assert.equal(day.calendarStatus, "ready");
    assert.equal(day.isShabbat, false);
    assert.equal(day.hebrewDate, "19 Elul 5786");
    assert.equal(day.hebrewDateHebrew, "י״ט אלול תשפ״ו");
    assert.equal(day.hebrewYear, 5786);
    assert.equal(day.parashah?.title, "Nitzavim-Vayeilech");
    assert.equal(day.parashah?.observedOn, "2026-09-05");
    assert.equal(day.parashah?.readingKind, "thisWeek");
    assert.equal(day.festivalShabbat, undefined);
    assert.deepEqual(day.holidays, []);
    assert.equal(day.onThisDay.length, 0);
  });

  it("maps Shabbat, a minor holiday, and the same-day parashah", () => {
    const day = mapHebcalDay(
      "2026-09-05",
      "America/New_York",
      load("shabbat-2026-09-05.json"),
    );

    assert.equal(day.isShabbat, true);
    assert.equal(day.parashah?.observedOn, "2026-09-05");
    assert.equal(day.observances[0]?.title, "Leil Selichot");
    assert.equal(day.holidays.length, 0);
  });

  it("maps a major holiday as a holiday, not an observance", () => {
    const day = mapHebcalDay(
      "2026-04-02",
      "America/New_York",
      load("pesach-2026-04-02.json"),
    );

    assert.equal(day.holidays[0]?.title, "Pesach I");
    assert.equal(day.holidays[0]?.kind, "major");
    assert.equal(day.holidays[0]?.yomTov, true);
    assert.equal(day.observances.length, 0);
  });

  it("maps a minor holiday separately from major festivals", () => {
    const day = mapHebcalDay(
      "2026-02-02",
      "America/New_York",
      load("tu-bishvat-2026-02-02.json"),
    );

    assert.equal(day.observances[0]?.title, "Tu BiShvat");
    assert.equal(day.observances[0]?.kind, "minor");
    assert.equal(day.holidays.length, 0);
  });

  it("maps Rosh Chodesh without treating it as a historical event", () => {
    const day = mapHebcalDay(
      "2026-01-19",
      "America/New_York",
      load("rosh-chodesh-2026-01-19.json"),
    );

    assert.equal(day.roshChodesh?.title, "Rosh Chodesh Sh’vat");
    assert.equal(day.hebrewMonth, "Sh'vat");
    assert.equal(day.hebrewDay, 1);
  });

  it("maps Omer count and sefirah when present", () => {
    const day = mapHebcalDay(
      "2026-04-20",
      "America/New_York",
      load("omer-2026-04-20.json"),
    );

    assert.equal(day.omer?.day, 18);
    assert.equal(day.omer?.sefira, "Eternity within Beauty");
    assert.match(day.omer?.countEnglish ?? "", /18 days/);
  });

  it("preserves Adar I / Adar II on a leap-year boundary", () => {
    const day = mapHebcalDay(
      "2024-03-10",
      "America/New_York",
      load("adar-ii-2024-03-10.json"),
    );

    assert.deepEqual(parseHdate("30 Adar I 5784"), {
      day: 30,
      month: "Adar I",
      year: 5784,
    });
    assert.equal(day.hebrewMonth, "Adar I");
    assert.equal(day.hebrewDay, 30);
    assert.equal(day.roshChodesh?.title, "Rosh Chodesh Adar II");
  });

  it("keeps special Shabbatot distinct from ordinary holidays", () => {
    const day = mapHebcalDay(
      "2026-02-28",
      "America/New_York",
      load("shabbat-zachor-2026-02-28.json"),
    );

    assert.equal(day.isShabbat, true);
    assert.equal(day.specialShabbat[0]?.title, "Shabbat Zachor");
    assert.equal(day.holidays.length, 0);
    assert.equal(day.parashah?.title, "Tetzaveh");
  });

  it("selects the upcoming Shabbat parashah from a multi-day Hebcal range", () => {
    const selected = selectUpcomingParashahItem(
      [
        {
          title: "Parashat Ki Tavo",
          date: "2026-08-29T12:00:00-04:00",
          category: "parashat",
        },
        {
          title: "Parashat Nitzavim-Vayeilech",
          date: "2026-09-05T12:00:00-04:00",
          category: "parashat",
        },
      ],
      "2026-09-01",
    );

    assert.equal(selected?.title, "Parashat Nitzavim-Vayeilech");
  });

  it("falls back to last week’s portion when the coming Saturday has none", () => {
    const selected = selectUpcomingParashahItem(
      [
        {
          title: "Parashat Nitzavim-Vayeilech",
          date: "2026-09-05T12:00:00-04:00",
          category: "parashat",
        },
      ],
      "2026-09-09",
    );

    assert.equal(selected?.title, "Parashat Nitzavim-Vayeilech");
    assert.equal(
      classifyTorahReadingKind(
        [
          {
            title: "Parashat Nitzavim-Vayeilech",
            date: "2026-09-05T12:00:00-04:00",
            category: "parashat",
          },
        ],
        "2026-09-09",
      ),
      "recent",
    );
  });

  it("names the coming festival Saturday without calling last week this week", () => {
    const items = [
      {
        title: "Parashat Nitzavim-Vayeilech",
        date: "2026-09-05T12:00:00-04:00",
        category: "parashat" as const,
      },
      {
        title: "Rosh Hashana 5787",
        date: "2026-09-12T12:00:00-04:00",
        category: "holiday" as const,
        yomtov: true,
      },
    ];

    const day = mapHebcalDay("2026-09-09", "America/New_York", { items });
    assert.equal(day.parashah?.readingKind, "recent");
    assert.equal(day.festivalShabbat?.title, "Rosh Hashana 5787");
    assert.equal(day.festivalShabbat?.observedOn, "2026-09-12");
    assert.equal(selectFestivalShabbat(items, "2026-09-12"), undefined);
  });
});
