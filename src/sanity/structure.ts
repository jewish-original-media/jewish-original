import type { StructureResolver } from "sanity/structure";

import { sanityEnv } from "./env";

const referenceTypes = [
  "person",
  "place",
  "geographicRegion",
  "topic",
  "historicalEra",
  "organization",
  "source",
];

const workflowStatuses = [
  ["Imported", "imported"],
  ["Needs review", "needsReview"],
  ["Duplicate candidates", "duplicateCandidate"],
  ["Fact check", "factCheck"],
  ["Rights review", "rightsReview"],
  ["Ready", "ready"],
  ["Rejected", "rejected"],
  ["Archived", "archived"],
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Jewish Original")
    .items([
      S.documentTypeListItem("historyEntry").title("All history entries"),
      S.listItem()
        .title("Public test candidates")
        .child(
          S.documentList()
            .title("Public test candidates")
            .apiVersion(sanityEnv.apiVersion)
            .schemaType("historyEntry")
            .filter('_type == "historyEntry" && publicTestCandidate == true'),
        ),
      S.listItem()
        .title("Recurring observances")
        .child(
          S.documentList()
            .title("Recurring observances")
            .apiVersion(sanityEnv.apiVersion)
            .schemaType("historyEntry")
            .filter(
              '_type == "historyEntry" && entryKind == "recurringObservance"',
            ),
        ),
      S.listItem()
        .title("History workflow")
        .child(
          S.list()
            .title("History workflow")
            .items(
              workflowStatuses.map(([title, status]) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentList()
                      .title(title)
                      .apiVersion(sanityEnv.apiVersion)
                      .schemaType("historyEntry")
                      .filter(
                        '_type == "historyEntry" && workflowStatus == $status',
                      )
                      .params({ status }),
                  ),
              ),
            ),
        ),
      S.divider(),
      S.documentTypeListItem("podcastShow").title("Podcast shows"),
      S.documentTypeListItem("podcastEpisode").title("Podcast episodes"),
      S.listItem()
        .title("Podcast workflow")
        .child(
          S.list()
            .title("Podcast workflow")
            .items(
              (
                [
                  ["Imported", "imported"],
                  ["Needs review", "needsReview"],
                  ["Fact check", "factCheck"],
                  ["Rights review", "rightsReview"],
                  ["Ready", "ready"],
                  ["Rejected", "rejected"],
                  ["Archived", "archived"],
                ] as const
              ).map(([title, status]) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentList()
                      .title(title)
                      .apiVersion(sanityEnv.apiVersion)
                      .schemaType("podcastEpisode")
                      .filter(
                        '_type == "podcastEpisode" && workflowStatus == $status',
                      )
                      .params({ status }),
                  ),
              ),
            ),
        ),
      S.divider(),
      S.documentTypeListItem("article").title("All Originals"),
      S.listItem()
        .title("Originals workflow")
        .child(
          S.list()
            .title("Originals workflow")
            .items(
              (
                [
                  ["Draft", "draft"],
                  ["Review", "review"],
                  ["Scheduled", "scheduled"],
                  ["Published", "published"],
                  ["Archived", "archived"],
                ] as const
              ).map(([title, status]) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentList()
                      .title(title)
                      .apiVersion(sanityEnv.apiVersion)
                      .schemaType("article")
                      .filter('_type == "article" && workflowStatus == $status')
                      .params({ status }),
                  ),
              ),
            ),
        ),
      S.divider(),
      S.listItem()
        .title("News")
        .child(
          S.list()
            .title("News")
            .items([
              S.listItem()
                .title("Sources")
                .child(
                  S.documentList()
                    .title("News sources")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("ingestSource")
                    .filter('_type == "ingestSource" && kind == "news"'),
                ),
              S.listItem()
                .title("Published")
                .child(
                  S.documentList()
                    .title("Published news")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("curatedNewsItem")
                    .filter(
                      '_type == "curatedNewsItem" && status == "published"',
                    ),
                ),
              S.listItem()
                .title("Exceptions")
                .child(
                  S.documentList()
                    .title("News exceptions")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("ingestException")
                    .filter(
                      '_type == "ingestException" && kind == "news" && status == "open"',
                    ),
                ),
            ]),
        ),
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Sources")
                .child(
                  S.documentList()
                    .title("Event sources")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("ingestSource")
                    .filter('_type == "ingestSource" && kind == "events"'),
                ),
              S.listItem()
                .title("Published / upcoming")
                .child(
                  S.documentList()
                    .title("Published events")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("event")
                    .filter('_type == "event" && status == "published"'),
                ),
              S.listItem()
                .title("Exceptions")
                .child(
                  S.documentList()
                    .title("Event exceptions")
                    .apiVersion(sanityEnv.apiVersion)
                    .schemaType("ingestException")
                    .filter(
                      '_type == "ingestException" && kind == "events" && status == "open"',
                    ),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Reference data")
        .child(
          S.list()
            .title("Reference data")
            .items(
              S.documentTypeListItems().filter((item) =>
                referenceTypes.includes(item.getId() || ""),
              ),
            ),
        ),
    ]);
