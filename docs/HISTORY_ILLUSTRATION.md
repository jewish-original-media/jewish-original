# Future JOM History illustration

Status: direction only. Do not mass-generate illustrations in this milestone.

## Purpose

Original Jewish Original historical illustration is a future asset class for
History featured media when no rights-cleared photograph exists, or when a
moment is better told as a drawing than as a borrowed image.

It must never masquerade as documentary photography.

## Desired style

- museum-quality editorial illustration
- archival line drawing
- ink / engraving / charcoal influence
- restrained JOM palette (sand, navy, gold, ink)
- historically grounded
- clearly presented as illustration

The drawing may portray an iconic Jewish history moment. The caption and the
`visualKind: "illustration"` label must say so.

## System readiness

`editorialImage.visualKind` now accepts:

- photograph
- illustration
- artifact
- map
- manuscript

Public History queries still emit featured media only when rights are
`cleared`, `publicDomain`, or `licensed`, and alt text exists.
`HistoryFeaturedMedia` labels illustrations as “Original illustration” and
shows caption, creator, and credit.

The first five published History articles have no public imagery. Do not attach
new images to them until a rights ledger exists.

## What this is not

- AI documentary-looking historical photographs
- unverified archival scans
- publisher News images
- stock “heritage” collage
- a required field on every History article
