"use client";

import { useId, useMemo, useState } from "react";

import {
  historyArchiveHref,
  type HistoryArchiveHrefQuery,
  type HistoryArchiveSearch,
} from "@/content/history/archive";
import type { HistoryArchiveFacets } from "@/content/history/types";
import {
  HISTORY_SUGGESTION_LABELS,
  suggestHistoryArchiveTerms,
  type HistorySuggestion,
} from "@/lib/history/suggestions";

type HistorySearchComboboxProps = {
  facets: HistoryArchiveFacets;
  search: HistoryArchiveSearch;
};

function suggestionHref(
  suggestion: HistorySuggestion,
  search: HistoryArchiveSearch,
) {
  const current: HistoryArchiveHrefQuery = {
    topic: search.topic,
    place: search.place,
    region: search.region,
    month: search.month,
    day: search.day,
    sort: search.sort,
    filter:
      search.filter &&
      search.filter.type !== "topic" &&
      search.filter.type !== "place" &&
      search.filter.type !== "region"
        ? search.filter
        : undefined,
  };

  if (suggestion.kind === "topic") {
    return historyArchiveHref({ ...current, topic: suggestion.slug });
  }
  if (suggestion.kind === "place") {
    return historyArchiveHref({ ...current, place: suggestion.slug });
  }
  if (suggestion.kind === "region") {
    return historyArchiveHref({ ...current, region: suggestion.slug });
  }
  return historyArchiveHref({
    ...current,
    filter: { type: "person", slug: suggestion.slug },
  });
}

export function HistorySearchCombobox({
  facets,
  search,
}: HistorySearchComboboxProps) {
  const listId = useId();
  const [value, setValue] = useState(search.query ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = useMemo(
    () => suggestHistoryArchiveTerms(value, facets),
    [facets, value],
  );
  const showList = open && suggestions.length > 0;
  const active = showList ? suggestions[activeIndex] : undefined;

  return (
    <div className="history-search-combobox">
      <input
        aria-activedescendant={
          active ? `${listId}-${active.kind}-${active.slug}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showList}
        autoComplete="off"
        id="history-search"
        maxLength={80}
        name="q"
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showList) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) =>
              index < suggestions.length - 1 ? index + 1 : 0,
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) =>
              index > 0 ? index - 1 : suggestions.length - 1,
            );
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            setActiveIndex(-1);
          } else if (event.key === "Enter" && active) {
            event.preventDefault();
            window.location.assign(suggestionHref(active, search));
          }
        }}
        placeholder="Search people, places, topics, or stories"
        role="combobox"
        type="search"
        value={value}
      />
      <ul hidden={!showList} id={listId} role="listbox">
        {suggestions.map((suggestion, index) => (
          <li
            aria-selected={index === activeIndex}
            id={`${listId}-${suggestion.kind}-${suggestion.slug}`}
            key={`${suggestion.kind}-${suggestion.slug}`}
            role="option"
          >
            <a
              href={suggestionHref(suggestion, search)}
              onMouseDown={(event) => event.preventDefault()}
            >
              <span>{suggestion.name}</span>{" "}
              <span>{HISTORY_SUGGESTION_LABELS[suggestion.kind]}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
