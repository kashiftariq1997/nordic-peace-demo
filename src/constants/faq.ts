export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

/**
 * FAQ content shown on /faq (sample copy — adjust freely). Answers that go
 * deeper link to the full policy pages from the page itself. The literal
 * `{threshold}` marker is substituted at render with the live free-shipping
 * amount in the store's currency (lib/shipping).
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "When will my order ship?",
    answer:
      "Orders leave our studio within 1–2 business days. You'll get a tracking email the moment your parcel is on its way.",
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "Yes — orders over {threshold} ship free within the US. Below that, a flat rate is shown at checkout before you pay anything.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We ship to most countries. International delivery takes 7–14 business days, and any duties are calculated at checkout so there are no surprises.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unworn pieces can be returned within 30 days of delivery for a full refund. Start the process from the Returns & Exchanges page and we'll send a prepaid label where available.",
  },
  {
    question: "How do I choose my size?",
    answer:
      "Our pajama sets run true to size with a relaxed fit — if you're between sizes, size up for the softest drape. Each product page lists full measurements for every option.",
  },
  {
    question: "How should I care for my pieces?",
    answer:
      "Wash cold on a gentle cycle and line dry, or tumble low. Our silks and linens are pre-washed so they only get softer with time.",
  },
  {
    question: "Can I add a gift message?",
    answer:
      "Absolutely. Add your note at checkout and we'll hand-write it on a card — prices are never included in the parcel.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "Send us a note from the contact page any time. We reply within two business days, usually much sooner.",
  },
];
