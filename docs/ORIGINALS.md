# Originals

Status: public journal on `feature/integration-homepage`. Sanity type remains
`article`. The public name is **Originals**.

Originals are Jewish Original Media’s own writing. They are not News, History,
Podcast, `blogPost`, or `newsletterPost`.

## Public routes

- `/originals` — journal index. One lead essay, then quieter titles.
- `/originals/[slug]` — essay. Published documents only. Drafts stay in
  preview and are noindexed.

Primary nav and the homepage module appear only when at least one Original is
published. The footer Explore list follows the same rule.

## Document

Studio title: Original. Schema: `src/sanity/schemaTypes/originals.ts`.

Required for publication:

- title, slug, author `person` references, excerpt, body
- publication date
- `workflowStatus = published`

Optional, when they exist:

- featured `editorialImage` with cleared rights
- topics
- citations
- related History
- related Podcast episodes
- SEO overrides
- review flags, editorial notes, correction history

Public reads require `workflowStatus == "published"`, no draft ID, and a
publication date. Scheduled essays stay in `scheduled` until an editor
publishes them. Archived documents never appear.

## First public essays

The first two published Originals adapt founder-approved About copy. They do
not invent founder history.

1. **Our Path Forward** (`our-path-forward`)
2. **What Drives Us** (`what-drives-us`)

Authors: Meyer Grunberg and Isaac Simon. Featured media on the first essay is
the class A founder photograph already used on `/about`.

Do not generate filler essays to thicken the journal.

## Homepage

`HomeOriginals` shows one featured essay and up to two supporting titles. It
is a journal band, not a card grid. It stays off Home until a published
Original exists.

## Studio

Desk: All Originals plus Draft / Review / Scheduled / Published / Archived.

## SEO

Canonical, Open Graph, CollectionPage on the index, Article JSON-LD on essays,
BreadcrumbList on both. Sitemap includes `/originals` and published slugs
only.
