const JEWISH_TERMS = [
  "jew",
  "jewish",
  "judaism",
  "israel",
  "israeli",
  "jerusalem",
  "hebrew",
  "torah",
  "synagogue",
  "holocaust",
  "shoah",
  "antisemit",
  "anti-semit",
  "zion",
  "diaspora",
  "rabbi",
  "kosher",
  "hanukkah",
  "chanukah",
  "passover",
  "pesach",
  "shabbat",
  "shabbos",
  "idf",
  "kibbutz",
  "yiddish",
  "sephardi",
  "ashkenazi",
  "mizrahi",
  "talmud",
  "menorah",
  "gaza",
  "west bank",
  "tel aviv",
  "haifa",
  "hebron",
  "judea",
  "samaria",
  "haredi",
  "hasidic",
  "chabad",
  "archaeolog",
  "philanthrop",
  "aipac",
  "knesset",
  "hamas",
  "hezbollah",
];

const IRRELEVANT_TERMS = [
  "box score",
  "stock market",
  "closing bell",
  "nba finals",
  "nfl draft",
  "premier league",
  "celebrity wedding",
  "red carpet",
];

const OPINION_TERMS = [
  "opinion:",
  "op-ed",
  "oped",
  "editorial:",
  "guest essay",
];

const SENSITIVE_TERMS = [
  "hostage",
  "hostages",
  "terror attack",
  "terrorist attack",
  "mass shooting",
  "active shooter",
  "sexual assault",
  "rape",
  "massacre",
];

const EVENT_DENYLIST = [
  "happy hour",
  "staff meeting",
  "internal meeting",
  "ticketed party",
  "mixer afterparty",
];

function includesAny(value: string, terms: readonly string[]) {
  const haystack = value.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

export function hasJewishLexicalSignal(value: string) {
  return includesAny(value, JEWISH_TERMS);
}

export function isObviouslyIrrelevant(value: string) {
  return includesAny(value, IRRELEVANT_TERMS) && !hasJewishLexicalSignal(value);
}

export function isOpinionSignal(title: string, url = "") {
  return (
    includesAny(`${title} ${url}`, OPINION_TERMS) || /\/opinion\//i.test(url)
  );
}

export function isSensitiveSignal(value: string) {
  return includesAny(value, SENSITIVE_TERMS);
}

export function isDeniedEvent(value: string) {
  return includesAny(value, EVENT_DENYLIST);
}

export function headlineIsValid(headline: string) {
  const trimmed = headline.trim();
  return trimmed.length >= 15 && trimmed.length <= 180;
}
