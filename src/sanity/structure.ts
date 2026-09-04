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
