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

## Editorial samples

The founder has identified the first two records as placeholder editorial
samples:

1. `article.our-path-forward` / `our-path-forward`
2. `article.what-drives-us` / `what-drives-us`

The application preserves those source documents but labels both listing and
detail presentation: **“Sample editorial content. Final essays coming soon.”**
Sample presentation does not show `authors` as a byline or emit author
metadata. Sample detail pages are `noindex`, omit Article JSON-LD, and are
excluded from the sitemap. The class A founder photograph on the first sample
keeps its factual alt text and credit.

No Sanity mutation is part of this UI workstream. The content workstream can
replace the sample by reviewing these fields on the two documents: `title`,
`excerpt`, `body`, `authors`, `publishedAt`, `featuredMedia`, `seo`, and
`workflowStatus`. Once final copy and authorship are explicitly approved, the
application’s temporary sample-slug registry can be removed.

Do not generate filler essays to thicken the journal.

## Homepage

`HomeOriginals` shows one featured essay and up to two supporting titles. It
is a journal band, not a card grid. It stays off Home until a published
Original exists.

## Studio

Desk: All Originals plus Draft / Review / Scheduled / Published / Archived.

## SEO

Canonical, Open Graph, and CollectionPage apply to the index. Final approved
essays receive Article JSON-LD and sitemap entries. Sample details receive a
canonical and BreadcrumbList for navigation but remain `noindex` and outside
the sitemap.
