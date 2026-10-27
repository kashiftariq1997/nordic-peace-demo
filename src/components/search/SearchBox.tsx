"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ROUTES } from "@/constants";
import { SearchIcon } from "@/icons";
import { getSearchSuggestions } from "@/lib/search-actions";
import type { SearchSuggestion } from "@/types";
import { formatMoney } from "@/utils";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type SuggestionState = {
  /** The query these suggestions were fetched for — keeps stale rows hidden. */
  query: string;
  items: SearchSuggestion[];
};

export type SearchBoxProps = {
  /** Current ?q= value; the key on this component remounts it across searches. */
  initialQuery?: string;
};

/**
 * Search input with live, debounced suggestions (spec Step C). Typing fetches
 * the top matches via a server action after 300ms of quiet; Enter (or the
 * "See all results" row) navigates to the results grid at /search?q=.
 */
export function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SuggestionState | null>(null);
  const [focused, setFocused] = useState(false);

  const query = value.trim();

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      getSearchSuggestions(query)
        .then((items) => {
          if (!cancelled) setSuggestions({ query, items });
        })
        .catch(() => {
          if (!cancelled) setSuggestions({ query, items: [] });
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  // Stale rows stay visible while the next debounce resolves (no panel flicker).
  const matching = suggestions?.items ?? [];
  const panelOpen = focused && query.length >= MIN_QUERY_LENGTH && matching.length > 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFocused(false);
    if (!query) return;
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`);
  };

  return (
    <form role="search" onSubmit={submit} className="relative z-20">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        autoComplete="off"
        value={value}
        placeholder="Search pajamas, robes, gifts…"
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setFocused(false);
        }}
        className="text-plum placeholder:text-plum-soft border-line hover:border-blush-deep h-12 w-full rounded-full border bg-white pr-32 pl-12 text-sm transition-colors duration-200 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <SearchIcon className="text-plum-soft pointer-events-none absolute top-1/2 left-5 h-4.5 w-4.5 -translate-y-1/2" />
      <button
        type="submit"
        className="bg-plum text-cream hover:bg-plum-soft absolute top-1/2 right-1.5 flex h-11 -translate-y-1/2 items-center rounded-full px-5 text-sm font-medium transition-colors"
      >
        Search
      </button>

      {panelOpen ? (
        <div className="border-line bg-cream shadow-soft absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-3xl border py-2">
          <ul aria-label="Search suggestions" className="flex flex-col">
            {matching.map((suggestion) => (
              <li key={suggestion.handle}>
                <Link
                  href={ROUTES.product(suggestion.handle)}
                  // Let the click land before the input's blur closes the panel.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setFocused(false)}
                  className="hover:bg-blush flex items-center gap-3 px-4 py-2.5 transition-colors"
                >
                  <span className="bg-blush relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                    {suggestion.imageUrl ? (
                      <Image
                        src={suggestion.imageUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="text-plum min-w-0 flex-1 truncate text-sm font-medium">
                    {suggestion.title}
                  </span>
                  <span className="text-plum-soft shrink-0 text-sm">
                    {formatMoney(suggestion.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-line border-t pt-1">
            <button
              type="submit"
              onMouseDown={(event) => event.preventDefault()}
              className="text-rose-ink hover:bg-blush flex min-h-11 w-full items-center px-4 text-left text-sm font-medium transition-colors"
            >
              See all results for “{query}”
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
