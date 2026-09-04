#!/usr/bin/env python3
"""Classify the JOM History archive for publication-readiness.

Read-only. Does not write to Sanity, rewrite source text, or touch
production import manifests. Emits sanitized metadata only — no source
bodies, emails, or restricted raw staging.

Inputs are the existing deterministic workbook audit outputs, not a
second extraction of the XLSX.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

WORKBOOK_SHA256 = (
    "f163dbda3fd82eb13ee82aab3be78f67750144dc934fd0af1affa8a84c0e837f"
)
ID_PREFIX = "jom-history:xlsx-f163dbda3fd82eb1"
BASE_COMMIT = "39d5859"
BASE_BRANCH = "milestone-1-sanity-history"

URL_RE = re.compile(r"https?://[^\s)\]>\"']+", re.I)
EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
ISO_RE = re.compile(r"^(-?\d{1,6})-(\d{2})-(\d{2})$")
SLASH_RE = re.compile(r"^(\d{1,2})/(\d{1,2})/(-?\d{1,6})$")
YEAR_RE = re.compile(r"\b(?:1[0-9]{3}|20[0-2][0-9])\b")

COMMERCIAL_HOST_MARKERS = (
    "gettyimages",
    "alamy",
    "shutterstock",
    "istockphoto",
    "google.com",
    "gstatic.com",
    "bing.com",
    "pinimg.com",
    "pinterest.",
)
WIKI_HOST_MARKERS = ("wikipedia.org", "wikimedia.org", "wikidata.org")
INSTITUTIONAL_HOST_MARKERS = (
    "ushmm.org",
    "yadvashem",
    "nli.org.il",
    "yivo.org",
    "lbi.org",
    "loc.gov",
    "archives.gov",
    "knesset.gov.il",
    "mfa.gov.il",
    "idf.il",
    "jewishvirtuallibrary.org",
    "jta.org",
    "jstor.org",
    "britannica.com",
)

HOLIDAY_TITLE_RE = re.compile(
    r"yom ha|hanukkah|chanukah|passover|pesach|purim|sukkot|shavuot|"
    r"rosh hash|yom kippur|tisha|lag ba|tu bi|simchat|yom hashoah|"
    r"holocaust remembrance|yom yerushalayim",
    re.I,
)

FACT_RISK_TITLE_RE = re.compile(
    r"\b(\d{1,3}(?:,\d{3})+|\d{4,})\b.*\b(kill|killed|murder|die|died|dead)",
    re.I,
)
LIBERATED_GHETTO_RE = re.compile(r"liberat.+\bghetto|\bghetto.+\bliberat", re.I)
CASUALTY_CONTEXT_RE = re.compile(
    r"\b(\d{1,3}(?:,\d{3})+|\d{4,})\b.{0,40}\b("
    r"kill|killed|murder|died|dead|deported|rescued|rescue|liberated|"
    r"prisoners|victims|massacre)\b",
    re.I,
)

# History-owned first-20 plus the one published article.
PUBLISHED_IDS = {f"{ID_PREFIX}:Form:row-0002"}
HISTORY_ACTIVE_IDS = {
    f"{ID_PREFIX}:Form:row-0003",  # Bialystok — next review
    f"{ID_PREFIX}:Form:row-0005",  # Westerweel — publication #2 draft
    f"{ID_PREFIX}:Form:row-0037",  # Willenberg
    f"{ID_PREFIX}:Form:row-0104",  # Tripoli replacement
    f"{ID_PREFIX}:Import:row-0011",  # Isaac Rulf — deferred
    f"{ID_PREFIX}:Import:row-0042",  # Herzl birthday — imported
    f"{ID_PREFIX}:Import:row-0111",  # Ze'evi — imported
}

# Supplemental clusters found by normalizing slash dates and birth-title
# variants. These do not replace artifacts/history-workbook/duplicate-clusters.json.
SUPPLEMENTAL_CLUSTERS: list[dict[str, Any]] = [
    {
        "clusterId": "qa-dachau-liberation",
        "kind": "alternate version",
        "recommendedAction": "keep published Form row 2; defer Form row 57",
        "note": "Same 1945-04-29 Dachau liberation already published. Different body, not an exact duplicate.",
        "members": [
            f"{ID_PREFIX}:Form:row-0002",
            f"{ID_PREFIX}:Form:row-0057",
        ],
    },
    {
        "clusterId": "qa-herzl-birth",
        "kind": "alternate version",
        "recommendedAction": "keep one; Form row 190 is unused, Import row 42 is already imported",
        "note": "Slash-date Form record matches imported Theodore Herzl birthday after date normalization. Theodor/Theodore spelling hid the pair.",
        "members": [
            f"{ID_PREFIX}:Form:row-0190",
            f"{ID_PREFIX}:Import:row-0042",
        ],
    },
    {
        "clusterId": "qa-judenstaat",
        "kind": "alternate version",
        "recommendedAction": "founder compare; prefer Form row 170 if publishing",
        "note": "Same 1896-02-14 publication event. Form is cleaner; Import restates and is longer.",
        "members": [
            f"{ID_PREFIX}:Form:row-0170",
            f"{ID_PREFIX}:Import:row-0016",
        ],
    },
    {
        "clusterId": "qa-herzl-death",
        "kind": "likely duplicate",
        "recommendedAction": "keep one",
        "note": "Same 1904-07-03 death date.",
        "members": [
            f"{ID_PREFIX}:Form:row-0205",
            f"{ID_PREFIX}:Import:row-0070",
        ],
    },
    {
        "clusterId": "qa-kagan-cohen-birth",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 171",
        "note": "Rachel Kagan-Cohen / Cohen-Kagan birthday, same 1888-02-19.",
        "members": [
            f"{ID_PREFIX}:Form:row-0171",
            f"{ID_PREFIX}:Import:row-0017",
        ],
    },
    {
        "clusterId": "qa-ad-gordon-birth",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 200",
        "members": [
            f"{ID_PREFIX}:Form:row-0200",
            f"{ID_PREFIX}:Import:row-0062",
        ],
    },
    {
        "clusterId": "qa-sharon-birth",
        "kind": "alternate version",
        "recommendedAction": "keep one; prefer Form row 174; Import has Bing image URLs",
        "members": [
            f"{ID_PREFIX}:Form:row-0174",
            f"{ID_PREFIX}:Import:row-0020",
        ],
    },
    {
        "clusterId": "qa-shlomo-hillel-birth",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 188",
        "members": [
            f"{ID_PREFIX}:Form:row-0188",
            f"{ID_PREFIX}:Import:row-0036",
        ],
    },
    {
        "clusterId": "qa-franz-kraus-birth",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 191",
        "members": [
            f"{ID_PREFIX}:Form:row-0191",
            f"{ID_PREFIX}:Import:row-0043",
        ],
    },
    {
        "clusterId": "qa-sukenik-birth",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; Eleazer/Eleazar spelling",
        "members": [
            f"{ID_PREFIX}:Form:row-0144",
            f"{ID_PREFIX}:Import:row-0088",
        ],
    },
    {
        "clusterId": "qa-hebron-1834",
        "kind": "alternate version",
        "recommendedAction": "founder compare; sensitive casualty and assault framing",
        "note": "1834 Hebron massacre, not 1929. Import contains Wikimedia/Google URLs.",
        "members": [
            f"{ID_PREFIX}:Form:row-0209",
            f"{ID_PREFIX}:Import:row-0078",
        ],
    },
    {
        "clusterId": "qa-altalena",
        "kind": "same event, different angle",
        "recommendedAction": "founder compare",
        "members": [
            f"{ID_PREFIX}:Form:row-0203",
            f"{ID_PREFIX}:Import:row-0067",
        ],
    },
    {
        "clusterId": "qa-kovner-legacy-birthday",
        "kind": "likely duplicate",
        "recommendedAction": "add Import row 26 to existing dup-cf922f6e3a",
        "note": "Existing Form/Form alternate cluster omitted the legacy birthday row.",
        "members": [
            f"{ID_PREFIX}:Form:row-0042",
            f"{ID_PREFIX}:Form:row-0180",
            f"{ID_PREFIX}:Import:row-0026",
        ],
    },
    {
        "clusterId": "qa-kalischer-birth",
        "kind": "conflicting version",
        "recommendedAction": "founder compare one-day date",
        "members": [
            f"{ID_PREFIX}:Form:row-0182",
            f"{ID_PREFIX}:Import:row-0028",
        ],
    },
    {
        "clusterId": "qa-bentov-birth",
        "kind": "conflicting version",
        "recommendedAction": "founder compare one-day date; Import also has CENTURY_CONFLICT",
        "members": [
            f"{ID_PREFIX}:Form:row-0184",
            f"{ID_PREFIX}:Import:row-0030",
        ],
    },
    {
        "clusterId": "qa-magen-david-adom",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; Magen/Megen spelling",
        "members": [
            f"{ID_PREFIX}:Form:row-0199",
            f"{ID_PREFIX}:Import:row-0060",
        ],
    },
    {
        "clusterId": "qa-golani",
        "kind": "alternate version",
        "recommendedAction": "keep one; prefer Form row 173; Import has Google image URLs",
        "members": [
            f"{ID_PREFIX}:Form:row-0173",
            f"{ID_PREFIX}:Import:row-0019",
        ],
    },
    {
        "clusterId": "qa-irgun-executions",
        "kind": "alternate version",
        "recommendedAction": "keep one; prefer Form row 187",
        "members": [
            f"{ID_PREFIX}:Form:row-0187",
            f"{ID_PREFIX}:Import:row-0034",
        ],
    },
    {
        "clusterId": "qa-israel-independence",
        "kind": "conflicting version",
        "recommendedAction": "founder compare May 14 vs May 15; Form 192 has partition/independence conflation",
        "members": [
            f"{ID_PREFIX}:Form:row-0192",
            f"{ID_PREFIX}:Import:row-0044",
        ],
    },
    {
        "clusterId": "qa-idf-founded",
        "kind": "alternate version",
        "recommendedAction": "keep one; prefer Form row 196",
        "note": "Missed because IDF vs Israel Defense Forces share almost no title tokens.",
        "members": [
            f"{ID_PREFIX}:Form:row-0196",
            f"{ID_PREFIX}:Import:row-0052",
        ],
    },
    {
        "clusterId": "qa-lod-airport",
        "kind": "same event, different angle",
        "recommendedAction": "founder compare; Import has Google image URLs",
        "members": [
            f"{ID_PREFIX}:Form:row-0197",
            f"{ID_PREFIX}:Import:row-0054",
        ],
    },
    {
        "clusterId": "qa-dolphinarium",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 198",
        "members": [
            f"{ID_PREFIX}:Form:row-0198",
            f"{ID_PREFIX}:Import:row-0055",
        ],
    },
    {
        "clusterId": "qa-columbia-ramon",
        "kind": "same event, different angle",
        "recommendedAction": "keep one",
        "members": [
            f"{ID_PREFIX}:Form:row-0148",
            f"{ID_PREFIX}:Import:row-0008",
        ],
    },
    {
        "clusterId": "qa-gaza-disengagement",
        "kind": "same event, different angle",
        "recommendedAction": "founder compare",
        "members": [
            f"{ID_PREFIX}:Form:row-0145",
            f"{ID_PREFIX}:Import:row-0097",
        ],
    },
    {
        "clusterId": "qa-egypt-embassy",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 172",
        "members": [
            f"{ID_PREFIX}:Form:row-0172",
            f"{ID_PREFIX}:Import:row-0018",
        ],
    },
    {
        "clusterId": "qa-bar-ilan",
        "kind": "same event, different angle",
        "recommendedAction": "founder compare conceived vs founded wording",
        "members": [
            f"{ID_PREFIX}:Form:row-0142",
            f"{ID_PREFIX}:Import:row-0083",
        ],
    },
    {
        "clusterId": "qa-elal-426",
        "kind": "likely duplicate",
        "recommendedAction": "keep one; prefer Form row 207",
        "members": [
            f"{ID_PREFIX}:Form:row-0207",
            f"{ID_PREFIX}:Import:row-0076",
        ],
    },
    {
        "clusterId": "qa-shalit-legacy",
        "kind": "likely duplicate",
        "recommendedAction": "add Import row 69 to existing dup-707cd232de; do not publish independently",
        "members": [
            f"{ID_PREFIX}:Form:row-0140",
            f"{ID_PREFIX}:Form:row-0204",
            f"{ID_PREFIX}:Import:row-0069",
        ],
    },
    {
        "clusterId": "qa-eichmann-legacy",
        "kind": "conflicting version",
        "recommendedAction": "add Import row 122 to existing dup-0240e094e8",
        "note": "Import date field is 1961-12-12; body says 15 December 1961. Form rows already conflict 1961-12-15 vs 1962-05-31.",
        "members": [
            f"{ID_PREFIX}:Form:row-0071",
            f"{ID_PREFIX}:Form:row-0118",
            f"{ID_PREFIX}:Import:row-0122",
        ],
    },
    {
        "clusterId": "qa-isaac-rulf",
        "kind": "conflicting fact version",
        "recommendedAction": "founder compare; History already deferred Import row 11",
        "note": "Import date field is 1831-02-10 but body says 1834. Form row 166 is 1834-02-10 and uses Ruff/Rulf mix. Alamy URL in Import body.",
        "members": [
            f"{ID_PREFIX}:Form:row-0166",
            f"{ID_PREFIX}:Import:row-0011",
        ],
    },
    {
        "clusterId": "qa-yamit",
        "kind": "conflicting version",
        "recommendedAction": "founder compare 1979 vs 1982",
        "members": [
            f"{ID_PREFIX}:Form:row-0189",
            f"{ID_PREFIX}:Import:row-0037",
        ],
    },
    {
        "clusterId": "qa-operation-tzur",
        "kind": "conflicting version",
        "recommendedAction": "founder compare 2021-03-11 vs 2021-03-21",
        "members": [
            f"{ID_PREFIX}:Form:row-0177",
            f"{ID_PREFIX}:Import:row-0023",
        ],
    },
    {
        "clusterId": "qa-knesset-building",
        "kind": "conflicting version",
        "recommendedAction": "founder compare 1966 vs 1969",
        "members": [
            f"{ID_PREFIX}:Form:row-0146",
            f"{ID_PREFIX}:Import:row-0103",
        ],
    },
    {
        "clusterId": "qa-yoel-palgi",
        "kind": "conflicting version",
        "recommendedAction": "founder compare 1918-01-01 vs 1919-01-19",
        "members": [
            f"{ID_PREFIX}:Form:row-0135",
            f"{ID_PREFIX}:Import:row-0002",
        ],
    },
]

CURATED_TOP20 = [
    f"{ID_PREFIX}:Form:row-0161",
    f"{ID_PREFIX}:Form:row-0157",
    f"{ID_PREFIX}:Form:row-0160",
    f"{ID_PREFIX}:Form:row-0125",
    f"{ID_PREFIX}:Form:row-0170",
    f"{ID_PREFIX}:Form:row-0006",
    f"{ID_PREFIX}:Form:row-0156",
    f"{ID_PREFIX}:Form:row-0127",
    f"{ID_PREFIX}:Form:row-0131",
    f"{ID_PREFIX}:Import:row-0118",
    f"{ID_PREFIX}:Form:row-0009",
    f"{ID_PREFIX}:Form:row-0162",
    f"{ID_PREFIX}:Form:row-0122",
    f"{ID_PREFIX}:Import:row-0112",
    f"{ID_PREFIX}:Form:row-0132",
    f"{ID_PREFIX}:Form:row-0152",
    f"{ID_PREFIX}:Form:row-0128",
    f"{ID_PREFIX}:Import:row-0125",
    f"{ID_PREFIX}:Form:row-0107",
    f"{ID_PREFIX}:Form:row-0052",
]

CURATED_FAST_LANE = [
    f"{ID_PREFIX}:Form:row-0161",
    f"{ID_PREFIX}:Form:row-0160",
    f"{ID_PREFIX}:Form:row-0156",
    f"{ID_PREFIX}:Form:row-0006",
    f"{ID_PREFIX}:Form:row-0128",
]

TOP20_NOTES: dict[str, dict[str, str]] = {
    f"{ID_PREFIX}:Form:row-0161": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Import as next clean medieval candidate after the current History queue.",
        "reason": "Foundational 1492 expulsion date, short usable Form body, no cluster, strong institutional path.",
        "qaIssues": "Slash date needs ISO conversion. Prose is usable with light tightening. No image in source.",
        "sourcePath": "Spanish royal decree texts; Encyclopaedia Judaica; National Library of Israel Sephardic collections.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Inquisition; Sephardic history; expulsion",
        "geography": "Spain / Iberia",
    },
    f"{ID_PREFIX}:Form:row-0157": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review; keep Nachmanides/Pablo Christiani identity tight.",
        "reason": "Medieval rabbinic disputation with a clear four-day start date and an obvious scholarly trail.",
        "qaIssues": "Slash date. Minor name typo risk (Christiani). Body is longer than Dachau but still On This Day scale.",
        "sourcePath": "Nachmanides Vikuach; Barcelona archival / James I context; Encyclopaedia Judaica; NLI.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Rabbinic / intellectual history; medieval Europe",
        "geography": "Crown of Aragon / Iberia",
    },
    f"{ID_PREFIX}:Form:row-0160": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Fast-lane import. Do not collapse into the 1654 arrival or 1730 consecration stories.",
        "reason": "Early American Jewish community history, precise civil date, no Holocaust/Israel concentration.",
        "qaIssues": "Request was denied at first; keep that fact. Distinct from Shearith Israel 1730.",
        "sourcePath": "American Jewish Historical Society; municipal New Amsterdam records; AJHS / Touro-related scholarship.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Jewish community history; American Jews",
        "geography": "New Amsterdam / North America",
    },
    f"{ID_PREFIX}:Form:row-0125": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review of the oath controversy; do not oversimplify.",
        "reason": "Canadian/British-imperial Jewish political history; clear date; underrepresented geography.",
        "qaIssues": "Slash date. Swearing-in and later seating fight need precise wording. Not a US story.",
        "sourcePath": "Assembly of Lower Canada journals; Library and Archives Canada; Canadian Jewish studies.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Jews in politics; community history",
        "geography": "Lower Canada / British North America",
    },
    f"{ID_PREFIX}:Form:row-0170": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Resolve qa-judenstaat first; then publish the Form row, not the Import restatement.",
        "reason": "Core Zionist publication event with a clean Form body and an easy primary-text path.",
        "qaIssues": "Supplemental cluster with Import row 16. Slash date. Do not treat Wikipedia as source of record.",
        "sourcePath": "Der Judenstaat primary text; NLI Herzl archive; Central Zionist Archives.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Zionism; intellectual history",
        "geography": "Vienna / Europe, Zionist thought",
    },
    f"{ID_PREFIX}:Form:row-0006": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Fast-lane review. Keep Holocaust context proportional to a birth/ordination article.",
        "reason": "Rabbinic and women's history with a short structurally clean Form body.",
        "qaIssues": "Later Theresienstadt/Auschwitz facts must be sourced. Not a cluster member.",
        "sourcePath": "Leo Baeck Institute; Stiftung Neue Synagoge / Centrum Judaicum; USHMM / Yad Vashem person files.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Rabbinic Judaism; women; Holocaust",
        "geography": "Berlin / Germany",
    },
    f"{ID_PREFIX}:Form:row-0156": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Fast-lane import. Verify statute title and effective date against the congressional text.",
        "reason": "American Jewish civil-military history, concise body, no image dependency.",
        "qaIssues": "Slash date and a minor comma splice. Confirm 17 July 1862 as the effective date.",
        "sourcePath": "US Statutes at Large; Congressional Globe; American Jewish Archives.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "American Jews; civil rights; military chaplaincy",
        "geography": "United States",
    },
    f"{ID_PREFIX}:Form:row-0127": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review of organization naming and later USCJ growth figures.",
        "reason": "American religious-community founding story; complements already-queued European Holocaust pieces.",
        "qaIssues": "Later '800 congregations' figure needs a dated source. Title uses the 1913 name.",
        "sourcePath": "United Synagogue / USCJ institutional history; JTS / Schechter papers; AJHS.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Rabbinic / denominational history; American Jews",
        "geography": "United States",
    },
    f"{ID_PREFIX}:Form:row-0131": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Verify 1953 radio-announcement facts and 1952 caseload numbers before copy-editing.",
        "reason": "Jews in STEM with a concrete public date and no archive duplication.",
        "qaIssues": "Epidemic statistics and Roosevelt aside must be sourced. Jewish identity should stay proportionate.",
        "sourcePath": "Salk Institute / Pitt archives; CDC / March of Dimes historical summaries; contemporary CBS/press.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Jews in STEM; American Jews",
        "geography": "United States",
    },
    f"{ID_PREFIX}:Import:row-0118": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review. Sensitive framing; use the UN text as the spine.",
        "reason": "Unclustered major 1947 date with a usable legacy body and an official primary source.",
        "qaIssues": "TOPIC_MISSING. Legacy Import. Politically sensitive. Blank region. Not a Holocaust story.",
        "sourcePath": "UN Resolution 181 text and voting record; NLI / CZA Yishuv reactions.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Zionism / Israel; international diplomacy",
        "geography": "Mandatory Palestine / United Nations",
    },
    f"{ID_PREFIX}:Form:row-0009": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard Holocaust-resistance review; keep casualty and leadership names sourced.",
        "reason": "Resistance rather than another camp-opening or death-count article; complements Dachau/Westerweel.",
        "qaIssues": "Names and sequence need USHMM/Yad Vashem checks. Not a cluster member.",
        "sourcePath": "USHMM Treblinka revolt; Yad Vashem; Polish/IPN camp scholarship.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Holocaust; resistance",
        "geography": "Occupied Poland / Europe",
    },
    f"{ID_PREFIX}:Form:row-0162": {
        "publicationValue": "MEDIUM",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Verify Havana 1906 congregation identity and drop slang if it is not a community self-name.",
        "reason": "Caribbean/Latin Jewish community founding date; rare geography in this archive.",
        "qaIssues": "'Jewbanos/Jewbanas' diction. Region tag says Europe, North America. Founding claim should be institutionally pinned.",
        "sourcePath": "Cuban Jewish community histories; AJHS / Latin American Jewish studies; Havana congregation records if recoverable.",
        "imageRights": "UNKNOWN",
        "topics": "Jewish community history; Diaspora",
        "geography": "Havana / Cuba",
    },
    f"{ID_PREFIX}:Form:row-0122": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard biography review; keep philanthropy claims conservative.",
        "reason": "Early American Jewish philanthropy and Newport/Touro connection, not another 20th-century death.",
        "qaIssues": "Slash date. Superlative 'never surpassed' claim. Death article, but geographically useful.",
        "sourcePath": "Touro Synagogue / Newport historical societies; AJHS; Touro philanthropic wills.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "American Jews; philanthropy; community history",
        "geography": "United States",
    },
    f"{ID_PREFIX}:Import:row-0112": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Standard review against the treaty text. Topic/region still blank.",
        "reason": "Modern diplomacy with a fixed official date; balances war-heavy Israel coverage.",
        "qaIssues": "TOPIC_MISSING. Legacy Import. Longer than Form average. No commercial image URLs observed.",
        "sourcePath": "Israel-Jordan Treaty of Peace text; MFA / Jordan official records; Knesset.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Israel; diplomacy; MENA",
        "geography": "Israel / Jordan",
    },
    f"{ID_PREFIX}:Form:row-0132": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review of name form (Carigal / Karigal) and Newport sermon facts.",
        "reason": "Colonial American rabbinic visit; Hebron-to-Newport connection; pre-Revolution date.",
        "qaIssues": "Title omits Raphael. Slash date. Longer body. Distinct from Shearith Israel and cemetery request.",
        "sourcePath": "Touro Synagogue / Newport historical society; published 1773 sermon; AJHS.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Rabbinic Judaism; American Jews",
        "geography": "Newport, Rhode Island / British North America",
    },
    f"{ID_PREFIX}:Form:row-0152": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Tighten event identity to the 1730 Mill Street consecration, not the 1654 arrival.",
        "reason": "First purpose-built synagogue in North America is archive-useful if the date is not blurred.",
        "qaIssues": "Body opens with the 1654 Recife/New Amsterdam arrival. Duplicate '1730 1730'. Related to, not the same as, Form row 160.",
        "sourcePath": "Congregation Shearith Israel; AJHS; New York municipal / synagogue histories.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Jewish community history; American Jews",
        "geography": "New York / North America",
    },
    f"{ID_PREFIX}:Form:row-0128": {
        "publicationValue": "HIGH",
        "researchBurden": "LOW",
        "recommendedAction": "Fast-lane review against Biographical Directory of Congress.",
        "reason": "Clear American political first, clean date, no cluster, useful after a run of medieval and Zionist pieces.",
        "qaIssues": "Light prose cleanup only. Confirm 4 March 1925 as seating/start date.",
        "sourcePath": "US House Biographical Directory; congressional record; AJHS / Western Jewish history.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Jews in politics; American Jews; women",
        "geography": "United States",
    },
    f"{ID_PREFIX}:Import:row-0125": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard review. Keep the Palestine Symphony Orchestra original name.",
        "reason": "Arts/music founding date; Huberman rescue-of-musicians context; not a war or death article.",
        "qaIssues": "Legacy Import. Blank region. Anachronistic public title is already explained in the body.",
        "sourcePath": "Israel Philharmonic / Huberman archives; NLI music collections; mandatory-period concert programs.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Arts / music; rescue; Yishuv",
        "geography": "Tel Aviv / Mandatory Palestine",
    },
    f"{ID_PREFIX}:Form:row-0107": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Verify arrival-window and 17,000–20,000 figures; do not treat as a single-day landing.",
        "reason": "Asia/refuge geography missing from the current public archive; Holocaust without another camp-liberation frame.",
        "qaIssues": "Date is a start-of-arrival marker, not a unique landing. Population figures need ranges and sources.",
        "sourcePath": "USHMM Shanghai; YIVO; Chinese/Shanghai Jewish refugee scholarship.",
        "imageRights": "RIGHTS CHECK NEEDED",
        "topics": "Holocaust; refuge; Diaspora",
        "geography": "Shanghai / China",
    },
    f"{ID_PREFIX}:Form:row-0052": {
        "publicationValue": "HIGH",
        "researchBurden": "MEDIUM",
        "recommendedAction": "Standard rescue review; hedge 'first and only' convoy-break language.",
        "reason": "Resistance/rescue with named actors and a concrete 1943-04-19 transport story.",
        "qaIssues": "Super-lative uniqueness claim. 1,631 passenger figure must be sourced. Same calendar day as Warsaw uprising — keep identities separate.",
        "sourcePath": "Kazerne Dossin / Mechelen; USHMM Transport XX; Belgian resistance scholarship.",
        "imageRights": "NO IMAGE NEEDED",
        "topics": "Holocaust; rescue; resistance",
        "geography": "Belgium / Europe",
    },
}


def sid(sheet: str, row: int) -> str:
    return f"{ID_PREFIX}:{sheet}:row-{row:04d}"


def parse_date(value: Any) -> str | None:
    if not value:
        return None
    text = str(value).strip()
    match = ISO_RE.match(text)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            dt.date(year, month, day)
            return f"{year:04d}-{month:02d}-{day:02d}"
        except ValueError:
            return None
    match = SLASH_RE.match(text)
    if match:
        month, day, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            dt.date(year, month, day)
            return f"{year:04d}-{month:02d}-{day:02d}"
        except ValueError:
            return None
    return None


def date_format(value: Any) -> str:
    text = str(value or "").strip()
    if not text:
        return "missing"
    if ISO_RE.match(text):
        return "iso"
    if SLASH_RE.match(text):
        return "slash"
    return "other"


def era_bucket(iso_date: str | None) -> str:
    if not iso_date:
        return "undated"
    year = int(iso_date.split("-")[0])
    if year < 500:
        return "ancient"
    if year < 1500:
        return "medieval"
    if year < 1800:
        return "earlyModern"
    if year < 1900:
        return "nineteenth"
    if year < 1940:
        return "1900-1939"
    if year < 1946:
        return "1940-1945"
    if year < 2000:
        return "1946-1999"
    return "2000+"


def event_kind(title: str) -> str:
    lowered = title.casefold()
    if re.search(r"\b(birthday|is born|born)\b", lowered):
        return "birth"
    if re.search(
        r"\b(passes away|passed away|dies|died|killed|murdered|executed|passing)\b",
        lowered,
    ):
        return "death"
    if re.search(r"\b(founded|established|consecrated|inaugurated|formed)\b", lowered):
        return "founding"
    return "event"


def split_labels(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[,;/]", value or "") if part.strip()]


def host_flags(urls: list[str]) -> dict[str, Any]:
    hosts = []
    commercial = []
    wiki = []
    institutional = []
    for url in urls:
        host = urlparse(url).netloc.lower()
        hosts.append(host)
        haystack = f"{host} {url.lower()}"
        if any(marker in haystack for marker in COMMERCIAL_HOST_MARKERS):
            commercial.append(host)
        if any(marker in haystack for marker in WIKI_HOST_MARKERS):
            wiki.append(host)
        if any(marker in haystack for marker in INSTITUTIONAL_HOST_MARKERS):
            institutional.append(host)
    return {
        "urlCount": len(urls),
        "hosts": sorted(set(hosts)),
        "commercialHosts": sorted(set(commercial)),
        "wikipediaHosts": sorted(set(wiki)),
        "institutionalHosts": sorted(set(institutional)),
    }


def default_input_dir() -> Path:
    here = Path(__file__).resolve()
    candidates = [
        Path("/Users/andy.katz/Desktop/Jewish Original Dev/artifacts/history-workbook"),
        here.parents[2] / "artifacts" / "history-workbook",
        Path.cwd() / "artifacts" / "history-workbook",
    ]
    for path in candidates:
        if (path / "candidates.jsonl").exists():
            return path
    return candidates[0]


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    records = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            records.append(json.loads(line))
    return records


def structural_flags(record: dict[str, Any]) -> list[str]:
    flags: list[str] = []
    body = record.get("body") or ""
    title = record.get("title") or ""
    raw_date = record.get("eventDate") or ""
    iso = parse_date(raw_date)
    existing = list(record.get("anomalies") or [])
    flags.extend(existing)

    fmt = date_format(raw_date)
    if fmt == "missing":
        if "DATE_MISSING" not in flags:
            flags.append("DATE_MISSING")
    elif fmt == "slash":
        flags.append("DATE_FORMAT_SLASH")
    elif fmt == "other":
        flags.append("DATE_UNPARSED")
    elif iso is None:
        flags.append("DATE_IMPOSSIBLE")

    stripped = body.strip()
    if not stripped:
        if "BODY_MISSING" not in flags:
            flags.append("BODY_MISSING")
    else:
        if len(stripped) < 150:
            flags.append("BODY_EXTREME_SHORT")
        if len(stripped) > 4000:
            flags.append("BODY_EXTREME_LONG")
        if title.strip() and stripped.casefold().startswith(title.strip().casefold()):
            flags.append("TITLE_REPEATED_IN_BODY")
        if "\t" in body or re.search(r"\b(sheet|column [a-z]|row \d+)\b", body, re.I):
            flags.append("SPREADSHEET_DEBRIS_SIGNAL")
        if body.count("On this day") >= 3:
            flags.append("REPEATED_ON_THIS_DAY")
        if re.search(r"<p></p>|<p>\s*</p>", body, re.I):
            flags.append("EMPTY_HTML_MARKUP")

    urls = URL_RE.findall(body)
    url_meta = host_flags(urls)
    if urls:
        flags.append("EMBEDDED_URLS")
    if url_meta["commercialHosts"]:
        flags.append("COMMERCIAL_OR_SEARCH_IMAGE_URL")
    if url_meta["wikipediaHosts"]:
        flags.append("WIKIPEDIA_URL")
    if any(marker in u.lower() for u in urls for marker in ("imgres", "image", ".jpg", ".png", ".jpeg", ".gif", "upload.")):
        flags.append("IMAGE_URL_IN_PROSE")
    if EMAIL_RE.search(body):
        flags.append("EMAIL_IN_BODY")

    if iso:
        years = {int(y) for y in YEAR_RE.findall(body)}
        event_year = int(iso.split("-")[0])
        if years and event_year not in years and abs(min(years, key=lambda y: abs(y - event_year)) - event_year) >= 2:
            flags.append("DATE_BODY_YEAR_DIVERGENCE")
        # Field/body lead-date mismatch: "On this day, Month Day, in YEAR"
        lead = re.search(
            r"on this day(?:,)?\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(?:in\s+)?(\d{4})",
            stripped[:180],
            re.I,
        )
        if lead:
            months = {
                "january": 1,
                "february": 2,
                "march": 3,
                "april": 4,
                "may": 5,
                "june": 6,
                "july": 7,
                "august": 8,
                "september": 9,
                "october": 10,
                "november": 11,
                "december": 12,
            }
            month = months.get(lead.group(1).casefold())
            day = int(lead.group(2))
            year = int(lead.group(3))
            if month:
                lead_iso = f"{year:04d}-{month:02d}-{day:02d}"
                if lead_iso != iso:
                    flags.append("DATE_FIELD_BODY_CONFLICT")

    if HOLIDAY_TITLE_RE.search(title):
        flags.append("RECURRING_OBSERVANCE_SIGNAL")
    if LIBERATED_GHETTO_RE.search(title):
        flags.append("LIBERATED_GHETTO_CONCEPT")
    if FACT_RISK_TITLE_RE.search(title) or len(CASUALTY_CONTEXT_RE.findall(body)) >= 2:
        flags.append("STATISTICAL_CLAIM_SIGNAL")
    if re.search(
        r"\b(millions of innocent|since time immemorial|always lived peacefully|"
        r"eradicated through|never surpassed)\b",
        body,
        re.I,
    ):
        flags.append("SWEEPING_CLAIM_SIGNAL")

    if record.get("sheet") == "Import":
        flags.append("LEGACY_SOURCE")
        elevated = {
            "BODY_MISSING",
            "DATE_MISSING",
            "DATE_MALFORMED",
            "CENTURY_CONFLICT",
            "COMMERCIAL_OR_SEARCH_IMAGE_URL",
            "DATE_FIELD_BODY_CONFLICT",
            "BODY_EXTREME_LONG",
            "BODY_EXTREME_SHORT",
            "TOPIC_MISSING",
        }
        if set(flags) & elevated:
            flags.append("LEGACY_RISK")

    if not split_labels(record.get("region") or ""):
        flags.append("REGION_BLANK")
    if not split_labels(record.get("topic") or "") and "TOPIC_MISSING" not in flags:
        flags.append("TOPIC_MISSING")

    # Deduplicate while preserving order
    seen = set()
    ordered = []
    for flag in flags:
        if flag not in seen:
            seen.add(flag)
            ordered.append(flag)
    return ordered


def image_rights(flags: list[str]) -> str:
    if "COMMERCIAL_OR_SEARCH_IMAGE_URL" in flags:
        return "COMMERCIAL / DO NOT USE"
    if "IMAGE_URL_IN_PROSE" in flags:
        return "RIGHTS CHECK NEEDED"
    return "NO IMAGE NEEDED"


def source_quality(flags: list[str], url_meta: dict[str, Any]) -> str:
    if url_meta["institutionalHosts"] and not url_meta["commercialHosts"]:
        return "institutional url present"
    if url_meta["wikipediaHosts"] and not url_meta["institutionalHosts"]:
        return "wikipedia-only or wikipedia-heavy"
    if url_meta["urlCount"] == 0:
        return "no sources present; institutional path may still exist"
    if url_meta["commercialHosts"]:
        return "legacy/web mix with commercial or search-image URLs"
    return "weak/legacy web sources"


def classify_tier(
    record: dict[str, Any],
    flags: list[str],
    existing_cluster: str | None,
    supplemental_cluster: str | None,
) -> str:
    title = record.get("title") or ""
    if (
        "RECURRING_OBSERVANCE_SIGNAL" in flags
        and "DATE_MISSING" in flags
        and HOLIDAY_TITLE_RE.search(title)
    ):
        return "RECURRING"
    if "BODY_MISSING" in flags or "MERGED_UNRELATED_BODY" in flags:
        return "E"
    if "BODY_EXTREME_SHORT" in flags and record.get("sheet") == "Import":
        return "E"
    if title.startswith("PM Ehud Barak Resigns") and "DATE_FIELD_BODY_CONFLICT" in flags:
        return "E"
    if existing_cluster or supplemental_cluster:
        return "D"
    if "DATE_FIELD_BODY_CONFLICT" in flags:
        return "C"
    if "LIBERATED_GHETTO_CONCEPT" in flags:
        return "C"
    if "CENTURY_CONFLICT" in flags:
        return "C"
    if FACT_RISK_TITLE_RE.search(record.get("title") or ""):
        return "C"
    if "STATISTICAL_CLAIM_SIGNAL" in flags and "SWEEPING_CLAIM_SIGNAL" in flags:
        return "C"
    if record.get("sourceId") == sid("Import", 116):
        return "C"
    correction = {
        "DATE_FORMAT_SLASH",
        "EMBEDDED_URLS",
        "WIKIPEDIA_URL",
        "BODY_EXTREME_LONG",
        "TOPIC_MISSING",
        "REGION_BLANK",
        "LEGACY_RISK",
        "TITLE_REPEATED_IN_BODY",
        "DATE_BODY_YEAR_DIVERGENCE",
        "STATISTICAL_CLAIM_SIGNAL",
        "SWEEPING_CLAIM_SIGNAL",
    }
    if set(flags) & correction:
        return "B"
    if record.get("sheet") == "Import":
        return "B"
    return "A"


def publication_value(record: dict[str, Any], flags: list[str], tier: str) -> str:
    if record["sourceId"] in TOP20_NOTES:
        return TOP20_NOTES[record["sourceId"]]["publicationValue"]
    if tier in {"D", "E", "RECURRING"}:
        return "DEFER"
    iso = parse_date(record.get("eventDate"))
    era = era_bucket(iso)
    kind = event_kind(record.get("title") or "")
    topics = " ".join(split_labels(record.get("topic") or "")).casefold()
    if era in {"ancient", "medieval", "earlyModern"}:
        return "HIGH"
    if "American Jews" in (record.get("topic") or "") or "North America" in (
        record.get("region") or ""
    ):
        return "HIGH"
    if kind == "death" and "Holocaust" in topics:
        return "LOW"
    if era == "1940-1945" and "Resistance" not in (record.get("topic") or ""):
        return "MEDIUM"
    if tier == "A":
        return "MEDIUM"
    return "MEDIUM"


def research_burden(tier: str, flags: list[str], source_id: str) -> str:
    if source_id in TOP20_NOTES:
        return TOP20_NOTES[source_id]["researchBurden"]
    if tier in {"C", "D"}:
        return "HIGH"
    if tier == "E" or tier == "RECURRING":
        return "HIGH"
    if "STATISTICAL_CLAIM_SIGNAL" in flags or "LEGACY_RISK" in flags:
        return "MEDIUM"
    if tier == "B":
        return "MEDIUM"
    return "LOW"


def founder_lane(tier: str, source_id: str) -> str:
    if source_id in CURATED_FAST_LANE or (
        tier == "A" and source_id not in PUBLISHED_IDS
    ):
        return "QUICK APPROVE"
    if tier == "B":
        return "STANDARD REVIEW"
    if tier in {"C", "D", "E", "RECURRING"}:
        return "DEEP REVIEW"
    return "STANDARD REVIEW"


def build_cluster_index(
    official: list[dict[str, Any]],
) -> tuple[dict[str, str], dict[str, str]]:
    official_of: dict[str, str] = {}
    supplemental_of: dict[str, str] = {}
    for cluster in official:
        for member in cluster["members"]:
            official_of[member["sourceId"]] = cluster["clusterId"]
    for cluster in SUPPLEMENTAL_CLUSTERS:
        for member in cluster["members"]:
            supplemental_of[member] = cluster["clusterId"]
    return official_of, supplemental_of


def classify_record(
    record: dict[str, Any],
    official_of: dict[str, str],
    supplemental_of: dict[str, str],
    first20: set[str],
) -> dict[str, Any]:
    flags = structural_flags(record)
    body = record.get("body") or ""
    urls = URL_RE.findall(body)
    url_meta = host_flags(urls)
    official = official_of.get(record["sourceId"])
    supplemental = supplemental_of.get(record["sourceId"])
    tier = classify_tier(record, flags, official, supplemental)
    iso = parse_date(record.get("eventDate"))
    row = {
        "sourceId": record["sourceId"],
        "sheet": record["sheet"],
        "row": record["row"],
        "table": record.get("table"),
        "title": record.get("title"),
        "sourceDateValue": record.get("eventDate"),
        "normalizedDate": iso,
        "dateFormat": date_format(record.get("eventDate")),
        "region": record.get("region") or "",
        "topic": record.get("topic") or "",
        "topics": split_labels(record.get("topic") or ""),
        "geographyLabels": split_labels(record.get("region") or ""),
        "legacySlug": record.get("legacySlug"),
        "sourceBodyChecksum": record.get("sourceBodyChecksum"),
        "rawRecordChecksum": record.get("rawRecordChecksum"),
        "bodyCharacterCount": len(body.strip()),
        "existingAnomalies": list(record.get("anomalies") or []),
        "qaFlags": flags,
        "readinessTier": tier,
        "publicationValue": publication_value(record, flags, tier),
        "researchBurden": research_burden(tier, flags, record["sourceId"]),
        "founderReviewLane": founder_lane(tier, record["sourceId"]),
        "officialDuplicateCluster": official,
        "supplementalQaCluster": supplemental,
        "inFirst20": record["sourceId"] in first20,
        "published": record["sourceId"] in PUBLISHED_IDS,
        "historyWorkstreamOwned": record["sourceId"] in PUBLISHED_IDS
        or record["sourceId"] in first20,
        "eventKind": event_kind(record.get("title") or ""),
        "eraBucket": era_bucket(iso),
        "imageRights": image_rights(flags),
        "sourceQuality": source_quality(flags, url_meta),
        "urlHosts": url_meta["hosts"],
        "commercialHosts": url_meta["commercialHosts"],
        "wikipediaHosts": url_meta["wikipediaHosts"],
        "institutionalHosts": url_meta["institutionalHosts"],
        "legacyRisk": "LEGACY_RISK" in flags,
    }
    return row


def inventory(rows: list[dict[str, Any]], first20: set[str]) -> dict[str, Any]:
    by_id = {row["sourceId"]: row for row in rows}
    blank_body = [row for row in rows if "BODY_MISSING" in row["qaFlags"]]
    official_clustered = [row for row in rows if row["officialDuplicateCluster"]]
    supplemental_only = [
        row
        for row in rows
        if row["supplementalQaCluster"] and not row["officialDuplicateCluster"]
    ]
    recurring = [row for row in rows if row["readinessTier"] == "RECURRING"]
    malformed = [
        row
        for row in rows
        if "MERGED_UNRELATED_BODY" in row["qaFlags"]
        or "DATE_IMPOSSIBLE" in row["qaFlags"]
        or row["sourceId"] == sid("Import", 119)
    ]
    return {
        "canonicalSourceRecords": len(rows),
        "formRecords": sum(1 for row in rows if row["sheet"] == "Form"),
        "legacyImportRecords": sum(1 for row in rows if row["sheet"] == "Import"),
        "alreadyPublished": {
            "count": sum(1 for row in rows if row["published"]),
            "records": [
                {"sourceId": sid("Form", 2), "title": by_id[sid("Form", 2)]["title"]}
            ],
            "evidence": "docs/HISTORY_ARCHIVE.md, docs/HISTORY_WESTERWEEL_SECOND_ARTICLE.md, artifacts/history-batch-1/drafts.json",
        },
        "existingSanityDraftsFromFirst20": {
            "importedFirst20": len(first20),
            "remainingDraftsIfOnlyDachauPublished": len(first20) - 1,
            "evidence": "docs/HISTORY_FIRST_20_MANIFEST.md; no project evidence of later archive imports",
            "note": "This workstream did not run a live full Sanity census.",
        },
        "knownOfficialDuplicateCandidates": {
            "clusters": 31,
            "clusteredRecords": len(official_clustered),
        },
        "supplementalQaClusters": {
            "clusters": len(SUPPLEMENTAL_CLUSTERS),
            "additionalRecordsNotInOfficialClusters": len(supplemental_only),
            "note": "Date-normalization and birth-title matching against existing audit outputs. Not a second official merge.",
        },
        "notYetImported": {
            "count": len(rows) - len(first20),
            "formula": "332 canonical source records minus 20 first-20 source IDs",
        },
        "missingOrBlankBody": {
            "count": len(blank_body),
            "form": sum(1 for row in blank_body if row["sheet"] == "Form"),
            "import": sum(1 for row in blank_body if row["sheet"] == "Import"),
        },
        "knownMalformedOrContaminated": {
            "count": len(malformed),
            "examples": [row["title"] for row in malformed],
        },
        "recurringObservancesPrimaryTier": {
            "count": len(recurring),
            "titles": [row["title"] for row in recurring],
            "alsoBlankHoliday": [
                row["title"]
                for row in rows
                if "RECURRING_OBSERVANCE_SIGNAL" in row["qaFlags"]
                and "BODY_MISSING" in row["qaFlags"]
            ],
        },
        "legacyRecords": {
            "count": sum(1 for row in rows if row["sheet"] == "Import"),
            "legacyRiskFlag": sum(1 for row in rows if row["legacyRisk"]),
        },
    }


def exception_queue(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id = {row["sourceId"]: row for row in rows}
    specs = [
        (
            "DATE CONFLICT",
            sid("Import", 11),
            "Date field is 1831-02-10; body says 1834. Form row 166 is the 1834 birth. Alamy URL in Import body.",
            "Which year is Isaak Rülf's birth, and which source row is canonical?",
            True,
        ),
        (
            "DATE CONFLICT",
            sid("Import", 116),
            "Date field is 1979-11-25 (Alma oil-field date). Body is UNSCR 242 on 22 November 1967.",
            "Do not publish from the date field. Recover 1967-11-22 or reject the row as contaminated.",
            True,
        ),
        (
            "DATE CONFLICT",
            sid("Import", 119),
            "Date field is 1949-12-13, shared with Mossad founded. Body is Barak's 2000 resignation.",
            "Treat as spreadsheet-date debris. Safe to defer indefinitely.",
            True,
        ),
        (
            "DATE CONFLICT",
            sid("Import", 123),
            "Date field is 1878-02-22; body lead says 22 December 1878 for Hatikvah.",
            "Fix date identity before any culture-queue use.",
            True,
        ),
        (
            "DATE CONFLICT",
            sid("Import", 115),
            "Date field is 1977-11-22; body lead is 20 November 1977 Sadat Knesset speech.",
            "Choose speech date vs related 22 November context before review.",
            True,
        ),
        (
            "IDENTITY CONFLICT",
            sid("Form", 166),
            "Isaac Ruff/Rulf spelling plus the 1831/1834 Import conflict.",
            "Confirm Isaak Rülf identity before using Form row 166 as a clean substitute.",
            True,
        ),
        (
            "DUPLICATE",
            sid("Form", 57),
            "Alternate Dachau liberation already published from Form row 2.",
            "Do not publish a second Dachau article from this row.",
            True,
        ),
        (
            "STATISTICAL CONFLICT",
            sid("Form", 153),
            "Title asserts 4,000 killed; long sweeping Inquisition essay.",
            "Deep review or defer. Not a fast On This Day candidate.",
            True,
        ),
        (
            "MALFORMED BODY",
            sid("Form", 4),
            "Existing MERGED_UNRELATED_BODY (Będzin + unrelated Regina Jonas / yellow-star debris).",
            "Already in first-20 as needsReview. Keep out of publication queue.",
            True,
        ),
        (
            "RIGHTS ISSUE",
            sid("Import", 11),
            "Embedded Alamy commercial image URL plus Google URL.",
            "Do not use those image URLs. History already deferred this draft.",
            True,
        ),
        (
            "RECURRING OBSERVANCE",
            sid("Import", 33),
            "Yom HaZikaron has no fixed Gregorian date.",
            "Route to recurring-observance model; do not invent a civil date.",
            True,
        ),
        (
            "RECURRING OBSERVANCE",
            sid("Import", 35),
            "Yom Ha'atzmaut has no fixed Gregorian date.",
            "Route to recurring-observance model; Independence Day Gregorian articles are a separate cluster.",
            True,
        ),
        (
            "RECURRING OBSERVANCE",
            sid("Import", 61),
            "Yom Yerushalayim / Jerusalem reunification row is blank-bodied.",
            "Needs source recovery and observance modeling. Defer.",
            True,
        ),
        (
            "LEGACY DEBRIS",
            sid("Import", 41),
            "88-character Benzion Netanyahu passing notice; also Teddy Kollek and Smoky Simon stubs.",
            "Do not promote stub legacy rows without source recovery.",
            True,
        ),
        (
            "POTENTIALLY SENSITIVE FRAMING",
            sid("Form", 192),
            "Independence article conflates November 1947 partition with 14 May 1948 and uses contested population-movement language. Clustered with Import row 44.",
            "Founder/editorial framing review before any independence publication.",
            True,
        ),
        (
            "POTENTIALLY SENSITIVE FRAMING",
            sid("Form", 185),
            "Deir Yassin already in official alternate-version cluster.",
            "Do not queue independently. Deep review if ever reconciled.",
            True,
        ),
    ]
    items = []
    for kind, source_id, why, decision, defer in specs:
        row = by_id[source_id]
        items.append(
            {
                "exceptionKind": kind,
                "sourceId": source_id,
                "title": row["title"],
                "date": row["normalizedDate"] or row["sourceDateValue"],
                "sheet": row["sheet"],
                "row": row["row"],
                "whyRisky": why,
                "founderDecisionNeeded": decision,
                "canDeferSafely": defer,
                "readinessTier": row["readinessTier"],
            }
        )
    return items


def queue_entry(row: dict[str, Any], rank: int) -> dict[str, Any]:
    notes = TOP20_NOTES[row["sourceId"]]
    return {
        "rank": rank,
        "title": row["title"],
        "date": row["normalizedDate"] or row["sourceDateValue"],
        "sourceDateValue": row["sourceDateValue"],
        "sourceId": row["sourceId"],
        "sourceSheet": row["sheet"],
        "sourceRow": row["row"],
        "readinessTier": row["readinessTier"],
        "publicationValue": notes["publicationValue"],
        "primaryTopics": notes["topics"],
        "geography": notes["geography"],
        "reason": notes["reason"],
        "knownQaIssues": notes["qaIssues"],
        "expectedResearchBurden": notes["researchBurden"],
        "recommendedAction": notes["recommendedAction"],
        "sourceResearchPath": notes["sourcePath"],
        "imageRights": notes["imageRights"],
        "officialDuplicateCluster": row["officialDuplicateCluster"],
        "supplementalQaCluster": row["supplementalQaCluster"],
        "qaFlags": row["qaFlags"],
    }


def summarize_official_clusters(
    official: list[dict[str, Any]], rows: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    by_id = {row["sourceId"]: row for row in rows}
    summaries = []
    for cluster in official:
        members = []
        for member in cluster["members"]:
            row = by_id[member["sourceId"]]
            members.append(
                {
                    "sourceId": member["sourceId"],
                    "title": member["title"],
                    "date": row["normalizedDate"] or member["eventDate"],
                    "sheet": member["sheet"],
                    "row": member["row"],
                }
            )
        kinds = cluster.get("classifications") or {}
        if kinds.get("exact duplicate"):
            likely = "exact duplicate"
        elif kinds.get("conflicting version"):
            likely = "conflicting fact version"
        elif kinds.get("alternate version"):
            likely = "alternate wording"
        else:
            likely = "likely duplicate"
        if any(m["sourceId"] in PUBLISHED_IDS for m in members):
            action = "keep published; do not queue others"
        elif len({m["date"] for m in members}) > 1:
            action = "founder compare"
        elif likely == "exact duplicate":
            action = "keep one"
        elif likely == "conflicting fact version":
            action = "founder compare"
        else:
            action = "keep one or merge later"
        summaries.append(
            {
                "clusterId": cluster["clusterId"],
                "official": True,
                "likely": likely,
                "classifications": kinds,
                "members": members,
                "recommendedAction": action,
                "inFirst20": any(by_id[m["sourceId"]]["inFirst20"] for m in members),
            }
        )
    return summaries


def default_output_dir() -> Path:
    return Path(__file__).resolve().parent


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=default_input_dir())
    parser.add_argument("--output-dir", type=Path, default=default_output_dir())
    args = parser.parse_args()

    candidates_path = args.input_dir / "candidates.jsonl"
    clusters_path = args.input_dir / "duplicate-clusters.json"
    manifest_path = args.input_dir / "first-20-manifest.json"
    audit_path = args.input_dir / "workbook-audit.json"
    for path in (candidates_path, clusters_path, manifest_path, audit_path):
        if not path.exists():
            print(f"Missing required audit output: {path}", file=sys.stderr)
            return 2

    candidates = load_jsonl(candidates_path)
    official_clusters = json.loads(clusters_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    first20 = {item["sourceId"] for item in manifest}
    official_of, supplemental_of = build_cluster_index(official_clusters)

    if audit.get("source", {}).get("sha256") != WORKBOOK_SHA256:
        print("Workbook checksum mismatch; refusing to classify.", file=sys.stderr)
        return 3

    rows = [
        classify_record(record, official_of, supplemental_of, first20)
        for record in candidates
    ]
    by_id = {row["sourceId"]: row for row in rows}
    for source_id in CURATED_TOP20 + CURATED_FAST_LANE:
        if source_id not in by_id:
            print(f"Curated source missing: {source_id}", file=sys.stderr)
            return 4

    tier_counts = dict(sorted(Counter(row["readinessTier"] for row in rows).items()))
    flag_counts = Counter(flag for row in rows for flag in row["qaFlags"])
    payload = {
        "generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "workstream": "research/history-qa",
        "nonProduction": True,
        "sanityWrites": False,
        "sourceTextRewritten": False,
        "analysisBase": {
            "commit": BASE_COMMIT,
            "branch": BASE_BRANCH,
            "workbookSha256": WORKBOOK_SHA256,
            "inputDir": str(args.input_dir),
            "officialDuplicateLogic": "artifacts/history-workbook/duplicate-clusters.json from scripts/history/audit-xlsx.py",
        },
        "privacy": {
            "sourceBodiesIncluded": False,
            "emailsIncluded": False,
            "restrictedRawStagingRead": False,
        },
        "inventory": inventory(rows, first20),
        "tierCounts": tier_counts,
        "flagCounts": dict(sorted(flag_counts.items())),
        "officialDuplicateClusters": summarize_official_clusters(official_clusters, rows),
        "supplementalQaClusters": SUPPLEMENTAL_CLUSTERS,
        "next20": [queue_entry(by_id[source_id], i) for i, source_id in enumerate(CURATED_TOP20, start=1)],
        "fastLaneNext5": [
            queue_entry(by_id[source_id], i)
            for i, source_id in enumerate(CURATED_FAST_LANE, start=1)
        ],
        "exceptionQueue": exception_queue(rows),
        "records": rows,
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    output_path = args.output_dir / "history-publication-queue.json"
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"wrote {output_path}")
    print("inventory", json.dumps(payload["inventory"]["canonicalSourceRecords"]))
    print("tiers", json.dumps(tier_counts))
    print(
        "notYetImported",
        payload["inventory"]["notYetImported"]["count"],
        "blankBody",
        payload["inventory"]["missingOrBlankBody"]["count"],
        "officialClustered",
        payload["inventory"]["knownOfficialDuplicateCandidates"]["clusteredRecords"],
        "supplementalOnly",
        payload["inventory"]["supplementalQaClusters"][
            "additionalRecordsNotInOfficialClusters"
        ],
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
