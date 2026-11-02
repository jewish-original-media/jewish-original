import { getCliClient } from "sanity/cli";

const draft = {
  _id: "drafts.torahPortionBrief.chayei-sara-2026",
  _type: "torahPortionBrief",
  canonicalTitle: "Chayei Sara",
  observedOn: "2026-11-07",
  hebcalSourceHref: "https://www.hebcal.com/sedrot/chayei-sara-20261107",
  status: "draft",
  synopsis:
    "Sarah dies, and Abraham purchases the Cave of Machpelah as a family burial place. Abraham then sends his servant to find a wife for Isaac; Rebekah chooses to leave her home, meets Isaac, and becomes his wife. The portion closes with Abraham’s death and burial by Isaac and Ishmael.",
  synopsisCitations: [
    {
      _key: "genesis-23-25",
      _type: "citation",
      title: "Genesis 23:1–25:18",
      publication: "Sefaria",
      kind: "book",
      url: "https://www.sefaria.org/Genesis.23.1-25.18?lang=bi",
      locator: "Genesis 23:1–25:18",
      verificationStatus: "unreviewed",
      note: "Editorial review must verify the synopsis against the primary text.",
    },
  ],
  teaching: {
    tradition: "Torah",
    quotation:
      "They called Rebekah and said to her, “Will you go with this man?” And she said, “I will.”",
    reflection:
      "Rebekah’s brief answer turns the story from arrangement to agency. A journey prepared by others still becomes hers through the clarity of her consent.",
    citation: {
      _type: "citation",
      title: "Genesis 24:58",
      publication: "Sefaria",
      kind: "book",
      url: "https://www.sefaria.org/Genesis.24.58?lang=bi",
      locator: "Genesis 24:58",
      quotation:
        "They called Rebekah and said to her, “Will you go with this man?” And she said, “I will.”",
      verificationStatus: "unreviewed",
      note: "Verify the exact edition and translation before publication.",
    },
  },
} as const;

async function main() {
  const apply = process.argv.includes("--apply");

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          apply: false,
          note: "Dry run only. The apply command creates a draft and never publishes it.",
          draft,
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = getCliClient({
    apiVersion: "2026-11-01",
    perspective: "raw",
    useCdn: false,
  });
  const existing = await client.getDocument(draft._id);
  if (existing) {
    throw new Error(
      `Draft ${draft._id} already exists; review it in Studio instead of overwriting editorial work.`,
    );
  }

  await client.create(draft);
  console.log(
    JSON.stringify(
      {
        apply: true,
        created: draft._id,
        status: "draft",
        note: "Human review and verified citations are still required before publication.",
      },
      null,
      2,
    ),
  );
}

void main();
