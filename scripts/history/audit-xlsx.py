#!/usr/bin/env python3
"""Audit the canonical JOM XLSX and create deterministic local staging.

The source workbook is opened read-only and never modified. Raw staging,
including contributor metadata, is written only below the ignored artifacts
directory. Sanitized reports and the proposed manifest contain no email values.
"""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import re
import unicodedata
import warnings
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from openpyxl import load_workbook
from openpyxl.cell.cell import Cell
from rapidfuzz import fuzz

WORKBOOK_NAMESPACE = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
RELATIONSHIP_NAMESPACE = (
    "http://schemas.openxmlformats.org/package/2006/relationships"
)
EMAIL_PATTERN = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
FORM_SHEET = "Form"
LEGACY_SHEET = "Import"

SHEET_CLASSIFICATIONS = {
    "Cover Page": ("instructions", "Workbook instructions; no history records."),
    "Form": (
        "canonical source",
        "Original Google Form submissions. Contributor email remains restricted.",
    ),
    "Content": (
        "derived pivot",
        "Unmaterialized pivot shell using the workbook pivot cache.",
    ),
    "Import Content": (
        "derived pivot",
        "Second unmaterialized pivot shell using the same pivot cache.",
    ),
    "Import": ("legacy source", "Canonical 124-row legacy CMS export."),
    "Sheet1": (
        "transformed legacy view",
        "Plain legacy projection with a computed century column.",
    ),
    "Sheet2": (
        "derived calculation",
        "Formula-only full-date and years-since calculations.",
    ),
    "Import2": (
        "transformed legacy view",
        "Legacy projection with generated HTML in the first body column.",
    ),
    "Import 3": (
        "transformed legacy view",
        "Materialized HTML/sorted legacy projection.",
    ),
    "Sheet4": ("derived index", "Title/slug index for 123 unique legacy slugs."),
}

RESERVED_SELECTIONS = [
    ("Form", 7, "Reserved Romanian yellow-star near-duplicate"),
    ("Form", 10, "Reserved Romanian yellow-star near-duplicate"),
    ("Form", 133, "Reserved Arik Einstein exact duplicate"),
    ("Form", 134, "Reserved Arik Einstein exact duplicate"),
    ("Form", 4, "Reserved merged/corrupt Będzin body"),
    ("Import", 39, "Reserved incomplete legacy record with blank body"),
    ("Import", 33, "Reserved recurring observance with no fixed date"),
    ("Form", 176, "Reserved Form/legacy overlap"),
    ("Import", 22, "Reserved Form/legacy overlap"),
    ("Import", 3, "Reserved legacy Operation Moses version"),
    ("Form", 141, "Reserved conflicting Balfour date"),
    ("Form", 208, "Reserved conflicting Balfour date"),
]


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def json_value(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def normalize_text(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(character for character in text if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def normalized_body(value: Any) -> str:
    return re.sub(r"\s+", " ", normalize_text(value))


def cell_payload(formula_cell: Cell, value_cell: Cell) -> Dict[str, Any]:
    if formula_cell.data_type == "f":
        return {
            "formula": formula_cell.value,
            "cachedResult": json_value(value_cell.value),
        }
    return {"value": json_value(formula_cell.value)}


def generated_id(checksum: str, sheet: str, row: int) -> str:
    return f"jom-history:xlsx-{checksum[:16]}:{sheet}:row-{row:04d}"


def source_date(value: Any) -> str:
    if isinstance(value, (datetime, date)):
        return value.date().isoformat() if isinstance(value, datetime) else value.isoformat()
    return str(value or "").strip()


def month_number(value: Any) -> Optional[int]:
    if isinstance(value, (int, float)) and 1 <= int(value) <= 12:
        return int(value)
    months = {
        "jan": 1,
        "feb": 2,
        "mar": 3,
        "apr": 4,
        "april": 4,
        "may": 5,
        "jun": 6,
        "jul": 7,
        "aug": 8,
        "sep": 9,
        "oct": 10,
        "nov": 11,
        "dec": 12,
    }
    return months.get(str(value or "").strip().casefold())


def expected_century(year: int) -> str:
    ordinal = ((year - 1) // 100) + 1
    suffix = (
        "th"
        if 11 <= ordinal % 100 <= 13
        else {1: "st", 2: "nd", 3: "rd"}.get(ordinal % 10, "th")
    )
    return f"{ordinal}{suffix}"


def headers_for_sheet(worksheet: Any, max_column: int) -> List[Dict[str, Any]]:
    headers = []
    for column in range(1, max_column + 1):
        value = worksheet.cell(1, column).value
        if value is not None:
            headers.append(
                {
                    "column": worksheet.cell(1, column).column_letter,
                    "header": str(value),
                }
            )
    return headers


def pivot_metadata(workbook_path: Path) -> Dict[str, Dict[str, Any]]:
    output: Dict[str, Dict[str, Any]] = {}
    namespace = {"s": WORKBOOK_NAMESPACE}
    with ZipFile(workbook_path) as archive:
        for member in archive.namelist():
            if not member.startswith("xl/pivotTables/pivotTable") or not member.endswith(
                ".xml"
            ):
                continue
            root = ET.fromstring(archive.read(member))
            location = root.find("s:location", namespace)
            name = root.attrib.get("name", member)
            reference = location.attrib.get("ref") if location is not None else None
            represented_rows = None
            if reference and ":" in reference:
                end = reference.split(":", 1)[1]
                match = re.search(r"(\d+)$", end)
                represented_rows = int(match.group(1)) - 1 if match else None
            output[name] = {
                "definition": member,
                "cacheId": root.attrib.get("cacheId"),
                "location": reference,
                "representedDataRows": represented_rows,
            }

        definition_name = "xl/pivotCache/pivotCacheDefinition1.xml"
        if definition_name in archive.namelist():
            root = ET.fromstring(archive.read(definition_name))
            cache = {
                "invalid": root.attrib.get("invalid") == "1",
                "refreshOnLoad": root.attrib.get("refreshOnLoad") == "1",
                "recordsPartPresent": any(
                    name.startswith("xl/pivotCache/pivotCacheRecords")
                    for name in archive.namelist()
                ),
            }
            for metadata in output.values():
                metadata["cache"] = cache
    return output


def workbook_inventory(
    workbook_path: Path, formula_workbook: Any, value_workbook: Any
) -> Dict[str, Any]:
    pivots = pivot_metadata(workbook_path)
    sheets = []
    for formula_sheet in formula_workbook.worksheets:
        value_sheet = value_workbook[formula_sheet.title]
        populated = [
            cell
            for row in formula_sheet.iter_rows()
            for cell in row
            if cell.value is not None
        ]
        max_row = max((cell.row for cell in populated), default=0)
        max_column = max((cell.column for cell in populated), default=0)
        formulas = [cell for cell in populated if cell.data_type == "f"]
        formula_results = [
            value_sheet[cell.coordinate].value for cell in formulas
        ]
        nonformula_rows = {
            cell.row for cell in populated if cell.row > 1 and cell.data_type != "f"
        }
        formula_rows = {cell.row for cell in formulas if cell.row > 1}
        classification, note = SHEET_CLASSIFICATIONS.get(
            formula_sheet.title, ("working sheet", "Unclassified workbook sheet.")
        )
        source_rows = 0
        if formula_sheet.title == FORM_SHEET:
            source_rows = sum(
                bool(formula_sheet.cell(row, 2).value)
                and bool(formula_sheet.cell(row, 4).value)
                for row in range(2, formula_sheet.max_row + 1)
            )
        elif formula_sheet.title == LEGACY_SHEET:
            source_rows = sum(
                bool(formula_sheet.cell(row, 1).value)
                for row in range(2, formula_sheet.max_row + 1)
            )
        elif formula_sheet.title in pivots:
            source_rows = pivots[formula_sheet.title]["representedDataRows"] or 0

        sheets.append(
            {
                "sheet": formula_sheet.title,
                "state": formula_sheet.sheet_state,
                "classification": classification,
                "note": note,
                "declaredDimension": formula_sheet.calculate_dimension(),
                "usedRows": max_row,
                "usedColumns": max_column,
                "sourceOrRepresentedRows": source_rows,
                "nonemptyCells": len(populated),
                "nonformulaDataRows": len(nonformula_rows),
                "formulaRows": len(formula_rows),
                "formulaCells": len(formulas),
                "formulaCachedResults": sum(
                    result is not None for result in formula_results
                ),
                "formulaMissingCachedResults": sum(
                    result is None for result in formula_results
                ),
                "headers": headers_for_sheet(formula_sheet, max_column),
                "tables": [
                    {"name": table.name, "range": table.ref}
                    for table in formula_sheet.tables.values()
                ],
                "pivot": pivots.get(formula_sheet.title),
                "mergedRanges": [
                    str(reference) for reference in formula_sheet.merged_cells.ranges
                ],
                "hiddenRows": sum(
                    bool(dimension.hidden)
                    for dimension in formula_sheet.row_dimensions.values()
                ),
                "hiddenColumns": sum(
                    bool(dimension.hidden)
                    for dimension in formula_sheet.column_dimensions.values()
                ),
            }
        )
    return {"sheetCount": len(sheets), "sheets": sheets, "pivots": pivots}


def form_records(
    checksum: str, formula_sheet: Any, value_sheet: Any
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    raw_records = []
    candidates = []
    for row in range(2, formula_sheet.max_row + 1):
        if not formula_sheet.cell(row, 2).value or not formula_sheet.cell(row, 4).value:
            continue
        source_id = generated_id(checksum, FORM_SHEET, row)
        raw = {
            "sourceId": source_id,
            "identifierKind": "generatedWorkbookCoordinate",
            "sheet": FORM_SHEET,
            "table": "Form source range",
            "row": row,
            "cells": {},
        }
        for column in range(2, 14):
            header = str(formula_sheet.cell(1, column).value or f"column_{column}")
            raw["cells"][header] = cell_payload(
                formula_sheet.cell(row, column), value_sheet.cell(row, column)
            )

        body = str(value_sheet.cell(row, 5).value or "")
        title = str(value_sheet.cell(row, 4).value or "").strip()
        date_value = value_sheet.cell(row, 9).value
        anomalies = []
        if not body.strip():
            anomalies.append("BODY_MISSING")
        if not source_date(date_value):
            anomalies.append("DATE_MISSING")
        if not str(value_sheet.cell(row, 6).value or "").strip():
            anomalies.append("REGION_MISSING")
        if not str(value_sheet.cell(row, 8).value or "").strip():
            anomalies.append("TOPIC_MISSING")
        if title == "Będzin Ghetto Uprising" and (
            "Regina Jonas" in body or "yellow star" in body.casefold()
        ):
            anomalies.append("MERGED_UNRELATED_BODY")

        candidates.append(
            {
                "sourceId": source_id,
                "identifierKind": "generatedWorkbookCoordinate",
                "sheet": FORM_SHEET,
                "table": "Form source range B1:M209",
                "row": row,
                "title": title,
                "body": body,
                "eventDate": source_date(date_value),
                "sourceDateValue": source_date(date_value),
                "region": str(value_sheet.cell(row, 6).value or "").strip(),
                "topic": str(value_sheet.cell(row, 8).value or "").strip(),
                "legacySlug": None,
                "legacyItemId": None,
                "legacyCollectionId": None,
                "anomalies": anomalies,
                "rawRecordChecksum": sha256_bytes(
                    json.dumps(raw, ensure_ascii=False, sort_keys=True).encode()
                ),
                "sourceBodyChecksum": sha256_bytes(body.encode()),
            }
        )
        raw_records.append(raw)
    return raw_records, candidates


def legacy_records(
    checksum: str, formula_sheet: Any, value_sheet: Any
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    raw_records = []
    candidates = []
    slug_counts = Counter(
        str(value_sheet.cell(row, 5).value or "").strip()
        for row in range(2, value_sheet.max_row + 1)
        if value_sheet.cell(row, 1).value
    )
    for row in range(2, formula_sheet.max_row + 1):
        if not formula_sheet.cell(row, 1).value:
            continue
        source_id = generated_id(checksum, LEGACY_SHEET, row)
        raw = {
            "sourceId": source_id,
            "identifierKind": "generatedWorkbookCoordinate",
            "sheet": LEGACY_SHEET,
            "table": "Legacy Import source range",
            "row": row,
            "cells": {},
        }
        for column in range(1, 20):
            header = str(
                formula_sheet.cell(1, column).value
                or f"column_{formula_sheet.cell(1, column).column_letter}"
            )
            raw["cells"][header] = cell_payload(
                formula_sheet.cell(row, column), value_sheet.cell(row, column)
            )

        title = str(value_sheet.cell(row, 1).value or "").strip()
        body = str(value_sheet.cell(row, 11).value or "")
        day = value_sheet.cell(row, 17).value
        month = value_sheet.cell(row, 2).value
        year = value_sheet.cell(row, 3).value
        parsed_month = month_number(month)
        parsed_year = int(year) if isinstance(year, (int, float)) else None
        parsed_day = int(day) if isinstance(day, (int, float)) else None
        event_date = (
            f"{parsed_year:04d}-{parsed_month:02d}-{parsed_day:02d}"
            if parsed_year and parsed_month and parsed_day
            else " ".join(str(value or "").strip() for value in [day, month, year]).strip()
        )
        anomalies = []
        if not body.strip():
            anomalies.append("BODY_MISSING")
        if not parsed_year or not parsed_month or not parsed_day:
            anomalies.append("DATE_MISSING" if not any([day, month, year]) else "DATE_MALFORMED")
        if not str(value_sheet.cell(row, 15).value or "").strip():
            anomalies.append("TOPIC_MISSING")
        century = str(value_sheet.cell(row, 4).value or "").strip()
        if parsed_year and century and normalize_text(century) != normalize_text(
            expected_century(parsed_year)
        ):
            anomalies.append("CENTURY_CONFLICT")
        slug = str(value_sheet.cell(row, 5).value or "").strip()
        if slug_counts[slug] > 1:
            anomalies.append("DUPLICATE_SLUG")

        candidates.append(
            {
                "sourceId": source_id,
                "identifierKind": "generatedWorkbookCoordinate",
                "sheet": LEGACY_SHEET,
                "table": "Legacy Import source range A1:S125",
                "row": row,
                "title": title,
                "body": body,
                "eventDate": event_date,
                "sourceDateValue": " ".join(
                    str(value or "").strip() for value in [day, month, year]
                ).strip(),
                "region": str(value_sheet.cell(row, 13).value or "").strip(),
                "topic": str(value_sheet.cell(row, 15).value or "").strip(),
                "legacySlug": slug,
                "legacyItemId": str(value_sheet.cell(row, 7).value or "").strip()
                or None,
                "legacyCollectionId": str(
                    value_sheet.cell(row, 6).value or ""
                ).strip()
                or None,
                "anomalies": anomalies,
                "rawRecordChecksum": sha256_bytes(
                    json.dumps(raw, ensure_ascii=False, sort_keys=True).encode()
                ),
                "sourceBodyChecksum": sha256_bytes(body.encode()),
            }
        )
        raw_records.append(raw)
    return raw_records, candidates


def pair_evidence(left: Dict[str, Any], right: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    left_title = normalize_text(left["title"])
    right_title = normalize_text(right["title"])
    title_score = fuzz.ratio(left_title, right_title)
    token_score = fuzz.token_set_ratio(left_title, right_title)
    left_body = normalized_body(left["body"])
    right_body = normalized_body(right["body"])
    body_score = (
        fuzz.ratio(left_body, right_body) if left_body and right_body else 0.0
    )
    same_date = bool(left["eventDate"]) and left["eventDate"] == right["eventDate"]
    same_title = bool(left_title) and left_title == right_title
    same_slug = bool(left.get("legacySlug")) and (
        left.get("legacySlug") == right.get("legacySlug")
    )

    classification = None
    if same_title and same_date and body_score >= 99.5:
        classification = "exact duplicate"
    elif (same_title or title_score >= 90) and left["eventDate"] != right["eventDate"]:
        classification = "conflicting version"
    elif same_date and same_title and body_score < 90:
        classification = "alternate version"
    elif same_date and (
        title_score >= 88
        or token_score >= 90
        or body_score >= 96
        or (token_score >= 75 and body_score >= 70)
    ):
        classification = "likely duplicate"
    elif same_slug:
        classification = "alternate version"

    if not classification:
        return None
    return {
        "left": left["sourceId"],
        "right": right["sourceId"],
        "classification": classification,
        "sameDate": same_date,
        "titleSimilarity": round(title_score, 1),
        "titleTokenSimilarity": round(token_score, 1),
        "bodySimilarity": round(body_score, 1),
    }


def duplicate_clusters(
    candidates: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    edges = []
    adjacency: Dict[str, Set[str]] = defaultdict(set)
    by_id = {record["sourceId"]: record for record in candidates}
    for left, right in itertools.combinations(candidates, 2):
        evidence = pair_evidence(left, right)
        if evidence:
            edges.append(evidence)
            adjacency[left["sourceId"]].add(right["sourceId"])
            adjacency[right["sourceId"]].add(left["sourceId"])

    clusters = []
    cluster_by_record: Dict[str, str] = {}
    visited = set()
    for source_id in sorted(adjacency):
        if source_id in visited:
            continue
        stack = [source_id]
        members = []
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            members.append(current)
            stack.extend(sorted(adjacency[current] - visited))
        members.sort()
        cluster_id = f"dup-{sha256_bytes('|'.join(members).encode())[:10]}"
        member_set = set(members)
        cluster_edges = [
            edge
            for edge in edges
            if edge["left"] in member_set and edge["right"] in member_set
        ]
        kinds = Counter(edge["classification"] for edge in cluster_edges)
        clusters.append(
            {
                "clusterId": cluster_id,
                "members": [
                    {
                        "sourceId": member,
                        "sheet": by_id[member]["sheet"],
                        "row": by_id[member]["row"],
                        "title": by_id[member]["title"],
                        "eventDate": by_id[member]["eventDate"],
                    }
                    for member in members
                ],
                "classifications": dict(sorted(kinds.items())),
                "evidence": cluster_edges,
                "editorialDecision": "pending",
            }
        )
        for member in members:
            cluster_by_record[member] = cluster_id
    return clusters, cluster_by_record


def year_and_quarter(record: Dict[str, Any]) -> Optional[Tuple[int, int]]:
    match = re.match(r"^(-?\d{1,6})-(\d{2})-(\d{2})$", record["eventDate"])
    if not match:
        return None
    year = int(match.group(1))
    month = int(match.group(2))
    return year, ((month - 1) // 3) + 1


def era_bucket(year: int) -> str:
    if year < 1900:
        return "pre1900"
    if year < 2000:
        return "twentieth"
    return "twentyFirst"


def capped_set(values: Set[str], limit: int) -> Tuple[str, ...]:
    cleaned = sorted(value for value in values if value)
    return ("*",) if len(cleaned) >= limit else tuple(cleaned)


def clean_stratified_selection(
    candidates: List[Dict[str, Any]], excluded_ids: Set[str]
) -> List[Dict[str, Any]]:
    pool = []
    for record in candidates:
        parsed = year_and_quarter(record)
        if (
            record["sheet"] not in {FORM_SHEET, LEGACY_SHEET}
            or record["sourceId"] in excluded_ids
            or record["anomalies"]
            or not parsed
            or not record["title"]
            or not record["body"]
            or not record["topic"]
        ):
            continue
        year, quarter = parsed
        record = dict(record)
        record["_year"] = year
        record["_quarter"] = quarter
        record["_era"] = era_bucket(year)
        record["_topics"] = {
            normalize_text(value)
            for value in re.split(r"[,;/]", record["topic"])
            if normalize_text(value)
        }
        record["_regions"] = {normalize_text(record["region"])}
        pool.append(record)
    pool.sort(key=lambda record: record["sourceId"])

    start = ((0, 0, 0, 0), (0, 0, 0), tuple(), tuple())
    states: Dict[
        Tuple[Tuple[int, ...], Tuple[int, ...], Tuple[str, ...], Tuple[str, ...]],
        Tuple[str, ...],
    ] = {start: tuple()}
    by_id = {record["sourceId"]: record for record in pool}
    era_index = {"pre1900": 0, "twentieth": 1, "twentyFirst": 2}
    targets = (2, 4, 2)

    for record in pool:
        updated = dict(states)
        for state, selected_rows in states.items():
            quarter_counts, era_counts, topics, regions = state
            quarter_index = record["_quarter"] - 1
            bucket_index = era_index[record["_era"]]
            if quarter_counts[quarter_index] >= 2 or era_counts[bucket_index] >= targets[
                bucket_index
            ]:
                continue
            new_quarters = list(quarter_counts)
            new_quarters[quarter_index] += 1
            new_eras = list(era_counts)
            new_eras[bucket_index] += 1
            topic_values = set(topics) | record["_topics"]
            region_values = set(regions) | record["_regions"]
            new_state = (
                tuple(new_quarters),
                tuple(new_eras),
                ("*",) if topics == ("*",) else capped_set(topic_values, 4),
                ("*",) if regions == ("*",) else capped_set(region_values, 3),
            )
            proposed = selected_rows + (record["sourceId"],)
            existing = updated.get(new_state)
            if existing is None or proposed < existing:
                updated[new_state] = proposed
        states = updated

    valid = [
        rows
        for (quarters, eras, topics, regions), rows in states.items()
        if quarters == (2, 2, 2, 2)
        and eras == targets
        and topics == ("*",)
        and regions == ("*",)
    ]
    if not valid:
        raise RuntimeError("No clean eight-record selection satisfies the approved strata.")
    selected_ids = min(valid)
    return [by_id[source_id] for source_id in selected_ids]


def workflow_status(record: Dict[str, Any], cluster_id: Optional[str]) -> str:
    if cluster_id:
        return "duplicateCandidate"
    if record["anomalies"]:
        return "needsReview"
    return "imported"


def build_manifest(
    candidates: List[Dict[str, Any]],
    cluster_by_record: Dict[str, str],
) -> List[Dict[str, Any]]:
    by_coordinate = {
        (record["sheet"], record["row"]): record for record in candidates
    }
    manifest = []
    reserved_ids = set()
    for sheet, row, reason in RESERVED_SELECTIONS:
        record = by_coordinate.get((sheet, row))
        if not record:
            raise RuntimeError(f"Reserved record missing: {sheet} row {row}")
        reserved_ids.add(record["sourceId"])
        manifest.append(
            {
                "sourceId": record["sourceId"],
                "identifierKind": record["identifierKind"],
                "sheet": record["sheet"],
                "table": record["table"],
                "row": record["row"],
                "title": record["title"],
                "eventDate": record["eventDate"],
                "reasonSelected": reason,
                "knownAnomalies": record["anomalies"],
                "duplicateCluster": cluster_by_record.get(record["sourceId"]),
                "expectedWorkflowStatus": workflow_status(
                    record, cluster_by_record.get(record["sourceId"])
                ),
            }
        )

    excluded = set(cluster_by_record) | reserved_ids
    clean_records = clean_stratified_selection(candidates, excluded)
    for record in clean_records:
        year, quarter = year_and_quarter(record) or (0, 0)
        manifest.append(
            {
                "sourceId": record["sourceId"],
                "identifierKind": record["identifierKind"],
                "sheet": record["sheet"],
                "table": record["table"],
                "row": record["row"],
                "title": record["title"],
                "eventDate": record["eventDate"],
                "reasonSelected": (
                    f"Clean deterministic stratum: Q{quarter}, "
                    f"{era_bucket(year)}, source row {record['row']}"
                ),
                "knownAnomalies": [],
                "duplicateCluster": None,
                "expectedWorkflowStatus": "imported",
            }
        )
    return manifest


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )


def write_jsonl(path: Path, records: Iterable[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def write_manifest_markdown(
    path: Path, checksum: str, manifest: Sequence[Dict[str, Any]]
) -> None:
    lines = [
        "# Proposed History First-20 Manifest",
        "",
        "Status: awaiting founder approval; **nothing in this manifest has been imported**.",
        "",
        f"Canonical workbook SHA-256: `{checksum}`",
        "",
        "Generated identifiers use the frozen workbook checksum prefix, worksheet,",
        "and original row coordinate. They are explicitly generated identifiers, not",
        "source-provided IDs.",
        "",
        "The reserved twelve exercise verified duplicates, overlaps, conflicting dates,",
        "a merged body, an incomplete body, and a recurring observance without a fixed",
        "date. The remaining eight are selected deterministically across both canonical",
        "source families because the Form source contains no pre-1900 rows. They retain",
        "two records per calendar quarter, two pre-1900 records, four twentieth-century",
        "records, two twenty-first-century records, and source-topic/geography diversity.",
        "",
    ]
    for index, record in enumerate(manifest, start=1):
        anomalies = ", ".join(record["knownAnomalies"]) or "None"
        cluster = record["duplicateCluster"] or "None"
        event_date = record["eventDate"] or "No fixed source date"
        lines.extend(
            [
                f"## {index}. {record['title']}",
                "",
                f"- Generated/source ID: `{record['sourceId']}`",
                f"- Source: `{record['sheet']}` / `{record['table']}` / row `{record['row']}`",
                f"- Event date: `{event_date}`",
                f"- Reason selected: {record['reasonSelected']}",
                f"- Known anomaly or review flag: {anomalies}",
                f"- Duplicate cluster: `{cluster}`",
                f"- Expected workflow status: `{record['expectedWorkflowStatus']}`",
                "",
            ]
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument(
        "--output", type=Path, default=Path("artifacts/history-workbook")
    )
    parser.add_argument(
        "--manifest-doc",
        type=Path,
        default=Path("docs/HISTORY_FIRST_20_MANIFEST.md"),
    )
    args = parser.parse_args()
    source = args.source.expanduser().resolve()
    output = args.output.resolve()
    source_bytes = source.read_bytes()
    checksum = sha256_bytes(source_bytes)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        formula_workbook = load_workbook(source, data_only=False, read_only=False)
        value_workbook = load_workbook(source, data_only=True, read_only=False)

    inventory = workbook_inventory(source, formula_workbook, value_workbook)
    form_raw, form_candidates = form_records(
        checksum, formula_workbook[FORM_SHEET], value_workbook[FORM_SHEET]
    )
    legacy_raw, legacy_candidates = legacy_records(
        checksum, formula_workbook[LEGACY_SHEET], value_workbook[LEGACY_SHEET]
    )
    raw_records = form_raw + legacy_raw
    candidates = form_candidates + legacy_candidates
    clusters, cluster_by_record = duplicate_clusters(candidates)
    manifest = build_manifest(candidates, cluster_by_record)

    if any(
        EMAIL_PATTERN.search(json.dumps(record, ensure_ascii=False))
        for record in candidates
    ):
        raise RuntimeError("PII detected in sanitized candidate staging.")
    if any(
        EMAIL_PATTERN.search(json.dumps(record, ensure_ascii=False))
        for record in manifest
    ):
        raise RuntimeError("PII detected in manifest.")

    anomaly_counts = Counter(
        anomaly for record in candidates for anomaly in record["anomalies"]
    )
    report = {
        "source": {
            "fileName": source.name,
            "sha256": checksum,
            "bytes": len(source_bytes),
            "modified": False,
        },
        "inventory": inventory,
        "canonicalSources": {
            "formRecords": len(form_candidates),
            "legacyRecords": len(legacy_candidates),
            "candidateSourceRecords": len(candidates),
            "candidateRecordGroupsBeforeEditorialResolution": len(candidates)
            - sum(len(cluster["members"]) - 1 for cluster in clusters),
        },
        "duplicateAnalysis": {
            "clusters": len(clusters),
            "clusteredRecords": len(cluster_by_record),
            "classificationCounts": dict(
                sorted(
                    Counter(
                        classification
                        for cluster in clusters
                        for classification, count in cluster["classifications"].items()
                        for _ in range(count)
                    ).items()
                )
            ),
        },
        "anomalyCounts": dict(sorted(anomaly_counts.items())),
        "privacy": {
            "rawStagingContainsRestrictedContributorMetadata": True,
            "rawStagingPath": str(output / "restricted" / "raw-records.jsonl"),
            "sanitizedCandidatePIIEmailMatches": 0,
            "manifestPIIEmailMatches": 0,
        },
        "lineage": [
            {
                "from": "Google Form",
                "to": "Form",
                "relationship": "original submissions",
            },
            {
                "from": "Form",
                "to": "Content",
                "relationship": "derived pivot; 207 represented rows; values not materialized",
            },
            {
                "from": "Form",
                "to": "Import Content",
                "relationship": "second derived pivot using same invalid external cache",
            },
            {
                "from": "Import",
                "to": "Sheet1",
                "relationship": "plain transformed legacy projection",
            },
            {
                "from": "Sheet1",
                "to": "Sheet2",
                "relationship": "date/years-since calculations",
            },
            {
                "from": "Import",
                "to": "Import2",
                "relationship": "HTML formula transformation",
            },
            {
                "from": "Import2",
                "to": "Import 3",
                "relationship": "materialized/sorted HTML copy",
            },
            {
                "from": "Import",
                "to": "Sheet4",
                "relationship": "title/unique-slug index",
            },
            {
                "from": "Form and Import",
                "to": "migration candidates",
                "relationship": "two canonical source families with reviewed overlap clusters",
            },
        ],
    }

    write_json(output / "workbook-audit.json", report)
    write_jsonl(output / "restricted" / "raw-records.jsonl", raw_records)
    write_jsonl(output / "candidates.jsonl", candidates)
    write_json(output / "duplicate-clusters.json", clusters)
    write_json(output / "first-20-manifest.json", manifest)
    write_manifest_markdown(args.manifest_doc.resolve(), checksum, manifest)
    print(
        json.dumps(
            {
                "workbookChecksum": checksum,
                "sheets": inventory["sheetCount"],
                "formRecords": len(form_candidates),
                "legacyRecords": len(legacy_candidates),
                "candidateRecords": len(candidates),
                "duplicateClusters": len(clusters),
                "candidateGroups": report["canonicalSources"][
                    "candidateRecordGroupsBeforeEditorialResolution"
                ],
                "manifestRecords": len(manifest),
                "output": str(output),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
