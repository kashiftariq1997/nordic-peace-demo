/** Lightweight search-suggestion row returned by the search server action. */
export type SearchSuggestion = {
  handle: string;
  title: string;
  price: { amount: number; currencyCode: string };
  imageUrl: string | null;
  imageAlt: string;
};
