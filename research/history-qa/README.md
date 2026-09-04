# History archive QA — isolated research workstream

Non-production. Read-only against existing History audit outputs.

This directory does **not** write to Sanity, change schemas, rewrite
source text, publish articles, or modify History application code.

## Analysis base

- Git commit: `39d5859`
- Branch checkpoint: `milestone-1-sanity-history`
- Isolated branch: `research/history-qa`
- Canonical workbook SHA-256:
  `f163dbda3fd82eb13ee82aab3be78f67750144dc934fd0af1affa8a84c0e837f`

## Reproduce

Requires the existing ignored audit outputs from
`scripts/history/audit-xlsx.py` (do not re-invent duplicate logic):

```shell
python3 research/history-qa/classify-publication-queue.py \
  --input-dir "/Users/andy.katz/Desktop/Jewish Original Dev/artifacts/history-workbook" \
  --output-dir research/history-qa
```

The classifier reads `candidates.jsonl`, `duplicate-clusters.json`,
`first-20-manifest.json`, and `workbook-audit.json`. It never opens the
XLSX and never reads `restricted/raw-records.jsonl`.

## Outputs

- `HISTORY_QA_PUBLICATION_QUEUE.md` — founder/History handoff
- `history-publication-queue.json` — sanitized metadata only
- `classify-publication-queue.py` — reproducible classifier

The JSON contains titles, dates, IDs, flags, and hostnames. It does not
contain source bodies, contributor emails, or restricted raw staging.

## Do not

- Merge this branch into History
- Import or publish from these files
- Commit workbook cells, emails, or `.env` files
