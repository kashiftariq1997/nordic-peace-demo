import type { Product, ProductVariant } from "@/types";
import { computeBadges } from "@/utils";

/**
 * SAMPLE CONTENT — mock demo catalog used when Shopify env vars are missing.
 *
 * Every product, price, inventory number, badge and review-free claim below is
 * illustrative demo data. It is NOT real inventory and must never be presented
 * as such. Illustrations live in /public/images/products (hand-drawn SVGs, no
 * external image dependencies).
 */

const MOCK_VENDOR = "Nordic Peace";
const DEFAULT_DELIVERY = "Packed with care — please allow 2–4 business days for dispatch.";

const PAJAMA_SIZE_CHART = `<table>
  <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th></tr></thead>
  <tbody>
    <tr><td>XS</td><td>32–34"</td><td>25–27"</td><td>35–37"</td></tr>
    <tr><td>S</td><td>34–36"</td><td>27–29"</td><td>37–39"</td></tr>
    <tr><td>M</td><td>36–38"</td><td>29–31"</td><td>39–41"</td></tr>
    <tr><td>L</td><td>39–41"</td><td>32–34"</td><td>42–44"</td></tr>
    <tr><td>XL</td><td>42–44"</td><td>35–37"</td><td>45–47"</td></tr>
  </tbody>
</table>`;

const BEDDING_SIZE_CHART = `<table>
  <thead><tr><th>Size</th><th>Dimensions</th></tr></thead>
  <tbody>
    <tr><td>Twin</td><td>66" × 96"</td></tr>
    <tr><td>Full</td><td>81" × 96"</td></tr>
    <tr><td>Queen</td><td>90" × 102"</td></tr>
    <tr><td>King</td><td>108" × 102"</td></tr>
  </tbody>
</table>`;

type MockProductSpec = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  price: number;
  /** SAMPLE compare-at price — demo only, never a real discount. */
  compareAtPrice?: number;
  inventory: number;
  unavailable?: string[];
  createdAt: string;
  collections: string[];
  fabric: string;
  care: string;
  highlights: string[];
  sizeChart?: string;
  deliveryNote?: string;
  pairsWith: string[];
};

const MOCK_PRODUCT_SPECS: readonly MockProductSpec[] = [
  {
    handle: "rosewater-silk-pajama-set",
    title: "Rosewater Silk Pajama Set",
    description:
      "A washed-silk two-piece with piped edges and a relaxed cut — made for unhurried mornings and slow coffee.",
    productType: "Pajama Set",
    tags: ["new", "bestseller", "silk"],
    colors: ["Rosewater", "Plum", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    price: 128,
    inventory: 40,
    createdAt: "2026-10-12T09:00:00.000Z",
    collections: ["pajama-sets", "new-arrivals", "bestsellers"],
    fabric: "95% mulberry silk, 5% elastane",
    care: "Hand wash cold or use a silk cycle. Line dry in shade. Cool iron on the reverse.",
    highlights: [
      "Silk-blend charmeuse with a soft sheen",
      "Relaxed fit with contrast piping",
      "Elastic waist with a ribbon drawcord",
    ],
    sizeChart: PAJAMA_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["sleep-mask-scrunchie-set", "cloud-knit-throw", "pearl-bow-clip-set"],
  },
  {
    handle: "blush-stripe-pajama-set",
    title: "Blush Stripe Pajama Set",
    description:
      "Crisp cotton poplin in a soft blush stripe, finished with a classic notched collar and ribbon-tie shorts.",
    productType: "Pajama Set",
    tags: ["cotton"],
    colors: ["Blush", "Cream"],
    sizes: ["XS", "S", "M", "L", "XL"],
    price: 98,
    inventory: 36,
    createdAt: "2026-08-05T09:00:00.000Z",
    collections: ["pajama-sets"],
    fabric: "100% organic cotton poplin",
    care: "Machine wash cold, gentle cycle. Tumble dry low. Warm iron if needed.",
    highlights: [
      "Crisp cotton poplin with a fine stripe",
      "Classic notched collar and button front",
      "Matching ribbon-tie shorts",
    ],
    sizeChart: PAJAMA_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["cozy-sock-duo", "scalloped-cotton-sheet-set"],
  },
  {
    handle: "cloud-waffle-pajama-set",
    title: "Cloud Waffle Pajama Set",
    description:
      "Breathable waffle knit with scallop-trimmed cuffs — the set you reach for all year round.",
    productType: "Pajama Set",
    tags: ["bestseller"],
    colors: ["Cream", "Blush"],
    sizes: ["S", "M", "L"],
    price: 112,
    inventory: 3,
    createdAt: "2026-07-18T09:00:00.000Z",
    collections: ["pajama-sets", "bestsellers"],
    fabric: "100% waffle-knit cotton",
    care: "Machine wash cold with like colours. Lay flat to dry. Do not bleach.",
    highlights: [
      "Breathable waffle texture",
      "Button-through top with a scallop trim",
      "Softly elasticated trousers",
    ],
    sizeChart: PAJAMA_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["cloud-knit-throw", "sleep-mask-scrunchie-set"],
  },
  {
    handle: "peony-check-pajama-set",
    title: "Peony Check Pajama Set",
    description:
      "Brushed cotton flannel in a peony check, edged with ric-rac — cozy nights in a pretty print.",
    productType: "Pajama Set",
    tags: ["new"],
    colors: ["Peony", "Cream"],
    sizes: ["XS", "S", "M", "L", "XL"],
    price: 104,
    inventory: 28,
    createdAt: "2026-10-05T09:00:00.000Z",
    collections: ["pajama-sets", "new-arrivals"],
    fabric: "100% brushed cotton flannel",
    care: "Machine wash warm, gentle cycle. Tumble dry low. Warm iron.",
    highlights: [
      "Brushed flannel that keeps you warm",
      "Festive peony check",
      "Chest pocket with ric-rac trim",
    ],
    sizeChart: PAJAMA_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["rosewater-scallop-mug", "cozy-sock-duo"],
  },
  {
    handle: "plum-lace-pajama-set",
    title: "Plum Lace-Trim Pajama Set",
    description:
      "A linen-cotton set trimmed in delicate plum lace with tonal piping — quietly romantic, endlessly wearable.",
    productType: "Pajama Set",
    tags: ["bestseller"],
    colors: ["Plum", "Blush"],
    sizes: ["XS", "S", "M", "L"],
    price: 136,
    // SAMPLE compare-at price for UI demo only — not a real discount.
    compareAtPrice: 160,
    inventory: 18,
    createdAt: "2026-06-20T09:00:00.000Z",
    collections: ["pajama-sets", "bestsellers"],
    fabric: "55% linen, 45% cotton",
    care: "Machine wash cold, gentle cycle. Reshape while damp. Line dry. Warm iron.",
    highlights: [
      "Delicate lace trim at the cuffs",
      "Tonal ribbon piping",
      "Relaxed straight-leg cut",
    ],
    sizeChart: PAJAMA_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["plum-velvet-bow-barrette", "heart-trinket-dish"],
  },
  {
    handle: "oat-linen-duvet-cover",
    title: "Oat Linen Duvet Cover",
    description:
      "Stonewashed linen with a lived-in drape and coconut-shell buttons — it only gets softer with washing.",
    productType: "Bedding",
    tags: ["linen"],
    colors: ["Oat", "Cream"],
    sizes: ["Twin", "Full", "Queen", "King"],
    price: 168,
    inventory: 22,
    createdAt: "2026-05-14T09:00:00.000Z",
    collections: ["cozy-home"],
    fabric: "100% washed linen",
    care: "Machine wash cold, gentle cycle. Tumble dry low. Softens with every wash.",
    highlights: [
      "Stonewashed linen with a lived-in drape",
      "Coconut-shell button closure",
      "Hidden interior corner ties",
    ],
    sizeChart: BEDDING_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["blush-pintuck-pillow-shams", "cloud-knit-throw"],
  },
  {
    handle: "blush-pintuck-pillow-shams",
    title: "Blush Pintuck Pillow Shams (Set of 2)",
    description:
      "Hand-sewn pintucks across soft cotton sateen — the finishing touch for a made bed.",
    productType: "Bedding",
    tags: ["new"],
    colors: ["Blush"],
    sizes: ["Standard", "King"],
    price: 58,
    inventory: 30,
    createdAt: "2026-09-28T09:00:00.000Z",
    collections: ["cozy-home", "new-arrivals"],
    fabric: "100% cotton sateen",
    care: "Machine wash cold, gentle cycle. Tumble dry low. Iron on reverse if needed.",
    highlights: ["Hand-sewn pintuck detail", "Envelope closure", "Set of two shams"],
    sizeChart: BEDDING_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["oat-linen-duvet-cover", "rosewater-silk-pajama-set"],
  },
  {
    handle: "cloud-knit-throw",
    title: "Cloud Knit Throw",
    description:
      "An oversized chunky cable knit finished with a scallop edge — for sofa evenings and end-of-bed layering.",
    productType: "Home",
    tags: ["bestseller", "gift"],
    colors: ["Cream", "Blush"],
    sizes: ["One Size"],
    price: 94,
    inventory: 45,
    createdAt: "2026-04-10T09:00:00.000Z",
    collections: ["cozy-home", "bestsellers", "gifts"],
    fabric: "100% cotton chunky knit",
    care: "Machine wash cold, gentle cycle in a mesh bag. Lay flat to dry.",
    highlights: [
      "Chunky cable knit",
      "Generously oversized for sofa or bed",
      "Finished with a scalloped edge",
    ],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["oat-linen-duvet-cover", "heart-trinket-dish"],
  },
  {
    handle: "scalloped-cotton-sheet-set",
    title: "Scalloped Cotton Sheet Set",
    description:
      "Crisp percale with an embroidered scallop along the flat sheet — hotel-crisp, coquette-sweet.",
    productType: "Bedding",
    tags: ["new"],
    colors: ["Cream", "Blush"],
    sizes: ["Twin", "Full", "Queen", "King"],
    price: 124,
    inventory: 26,
    createdAt: "2026-10-01T09:00:00.000Z",
    collections: ["cozy-home", "new-arrivals"],
    fabric: "400 thread-count cotton percale",
    care: "Machine wash warm. Tumble dry low. Warm iron for a crisp finish.",
    highlights: [
      "Embroidered scallop along the flat sheet",
      "Cool, crisp percale weave",
      "Four-piece set",
    ],
    sizeChart: BEDDING_SIZE_CHART,
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["oat-linen-duvet-cover", "blush-pintuck-pillow-shams"],
  },
  {
    handle: "rosewater-scallop-mug",
    title: "Rosewater Scallop Mug",
    description: "Hand-painted stoneware with a scalloped rim — your morning tea, prettied up.",
    productType: "Home",
    tags: ["gift"],
    colors: ["Rosewater", "Cream"],
    sizes: ["One Size"],
    price: 32,
    inventory: 50,
    createdAt: "2026-03-15T09:00:00.000Z",
    collections: ["cozy-home", "gifts"],
    fabric: "Glazed stoneware",
    care: "Dishwasher and microwave safe.",
    highlights: ["Hand-painted scallop rim", "Holds 12 oz", "Sold individually"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["cozy-sock-duo", "linen-vanity-tray"],
  },
  {
    handle: "scallop-vanity-mirror",
    title: "Scallop Vanity Mirror",
    description:
      "A scalloped freestanding mirror that tilts — the prettiest corner of the dressing table.",
    productType: "Vanity",
    tags: [],
    colors: ["Cream", "Blush"],
    sizes: ["One Size"],
    price: 76,
    inventory: 20,
    createdAt: "2026-02-20T09:00:00.000Z",
    collections: ["vanity-edit"],
    fabric: "Powder-coated metal frame with glass",
    care: "Wipe clean with a soft, dry cloth.",
    highlights: ["Scalloped metal frame", "Freestanding tilting hinge", "10 × 14 in"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["blush-velvet-jewelry-box", "linen-vanity-tray"],
  },
  {
    handle: "blush-velvet-jewelry-box",
    title: "Blush Velvet Jewelry Box",
    description:
      "Cotton velvet over a tidy interior of ring rolls and a hidden compartment, finished with a ribbon tie.",
    productType: "Vanity",
    tags: ["gift", "bestseller"],
    colors: ["Blush"],
    sizes: ["One Size"],
    price: 64,
    inventory: 40,
    createdAt: "2026-06-05T09:00:00.000Z",
    collections: ["vanity-edit", "gifts", "bestsellers"],
    fabric: "Cotton velvet over a wooden frame",
    care: "Spot clean with a damp cloth. Keep away from direct sunlight.",
    highlights: [
      "Ring rolls and a hidden compartment",
      "Removable travel pouch",
      "Ribbon-tie closure",
    ],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["pearl-bow-clip-set", "heart-trinket-dish"],
  },
  {
    handle: "linen-vanity-tray",
    title: "Linen Vanity Tray",
    description:
      "A washable linen cover over a rigid base — corral perfumes, brushes and little treasures.",
    productType: "Vanity",
    tags: ["new"],
    colors: ["Oat", "Blush"],
    sizes: ["One Size"],
    price: 42,
    inventory: 34,
    createdAt: "2026-09-20T09:00:00.000Z",
    collections: ["vanity-edit", "new-arrivals"],
    fabric: "Stonewashed linen with a rigid base",
    care: "Removable cover — machine wash cold. Wipe the base clean.",
    highlights: ["Corrals perfumes and brushes", "Non-slip suede base", "Removable washable cover"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["scallop-vanity-mirror", "blush-velvet-jewelry-box"],
  },
  {
    handle: "satin-ribbon-bow-clip-set",
    title: "Satin Ribbon Bow Clip Set",
    description:
      "Three hand-tied satin bows on gentle alligator clips — one for each day of the week's mood.",
    productType: "Hair Accessories",
    tags: ["bestseller", "gift", "hair-accessories"],
    colors: ["Blush", "Cream", "Plum"],
    sizes: ["One Size"],
    price: 18,
    inventory: 60,
    createdAt: "2026-01-12T09:00:00.000Z",
    collections: ["vanity-edit", "gifts", "bestsellers"],
    fabric: "Satin ribbon with French barrette clips",
    care: "Spot clean only.",
    highlights: ["Set of three bows", "Hand-tied ribbon tails", "Gentle alligator clips"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["plum-velvet-bow-barrette", "sleep-mask-scrunchie-set"],
  },
  {
    handle: "plum-velvet-bow-barrette",
    title: "Plum Velvet Bow Barrette",
    description:
      "A structured single bow in deep plum velvet with grip teeth that stay put all day.",
    productType: "Hair Accessories",
    tags: ["new", "hair-accessories"],
    colors: ["Plum"],
    sizes: ["One Size"],
    price: 22,
    inventory: 38,
    createdAt: "2026-10-08T09:00:00.000Z",
    collections: ["vanity-edit", "new-arrivals"],
    fabric: "Cotton velvet",
    care: "Spot clean only.",
    highlights: ["Structured single bow", "Non-slip grip teeth", "Everyday to evening"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["satin-ribbon-bow-clip-set", "plum-lace-pajama-set"],
  },
  {
    handle: "pearl-bow-clip-set",
    title: "Pearl & Bow Clip Set",
    description:
      "Satin bows scattered with faux pearls — two clips for when the outfit needs a little shine.",
    productType: "Hair Accessories",
    tags: ["hair-accessories"],
    colors: ["Cream", "Blush"],
    sizes: ["One Size"],
    price: 26,
    inventory: 4,
    createdAt: "2026-07-02T09:00:00.000Z",
    collections: ["vanity-edit"],
    fabric: "Satin ribbon with faux-pearl accents",
    care: "Spot clean only. Store flat.",
    highlights: ["Scattered faux pearls", "Set of two clips", "Bridal-ready"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["satin-ribbon-bow-clip-set", "blush-velvet-jewelry-box"],
  },
  {
    handle: "sleep-mask-scrunchie-set",
    title: "Sleep Mask & Scrunchie Set",
    description: "A padded silk sleep mask with two matching scrunchies, boxed and ready to gift.",
    productType: "Gift",
    tags: ["gift"],
    colors: ["Blush", "Plum"],
    sizes: ["One Size"],
    price: 34,
    inventory: 44,
    createdAt: "2026-08-22T09:00:00.000Z",
    collections: ["gifts"],
    fabric: "Washed silk cover with cotton filling",
    care: "Hand wash cold. Line dry.",
    highlights: ["Light-blocking padded mask", "Two silk scrunchies", "Gift-ready box"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["rosewater-silk-pajama-set", "cozy-sock-duo"],
  },
  {
    handle: "cozy-sock-duo",
    title: "Cozy Sock Duo",
    description: "Two pairs of brushed cushioned socks with a ribbed cuff that actually stays up.",
    productType: "Gift",
    tags: ["gift"],
    colors: ["Cream", "Blush"],
    sizes: ["S", "M", "L"],
    price: 24,
    inventory: 55,
    createdAt: "2026-09-05T09:00:00.000Z",
    collections: ["gifts"],
    fabric: "Soft brushed cotton-blend knit",
    care: "Machine wash cold. Tumble dry low.",
    highlights: ["Two pairs per set", "Cushioned sole", "Ribbed cuff that stays put"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["sleep-mask-scrunchie-set", "cloud-knit-throw"],
  },
  {
    handle: "heart-trinket-dish",
    title: "Heart Trinket Dish",
    description: "A little glazed heart for rings, pins and the earrings you take off at night.",
    productType: "Gift",
    tags: ["gift"],
    colors: ["Blush", "Cream"],
    sizes: ["One Size"],
    price: 28,
    inventory: 48,
    createdAt: "2026-05-30T09:00:00.000Z",
    collections: ["vanity-edit", "gifts"],
    fabric: "Glazed ceramic",
    care: "Hand wash recommended. Not dishwasher safe.",
    highlights: ["Ring and pin dish", "Gold-tone rim", "Fits in a stocking"],
    deliveryNote: DEFAULT_DELIVERY,
    pairsWith: ["blush-velvet-jewelry-box", "pearl-bow-clip-set"],
  },
];

function buildMockVariants(spec: MockProductSpec): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const unavailable = new Set(spec.unavailable ?? []);

  for (const color of spec.colors) {
    for (const size of spec.sizes) {
      const title = `${color} / ${size}`;
      const availableForSale = !unavailable.has(title);
      variants.push({
        id: `mock-variant-${spec.handle}-${variants.length}`,
        title,
        availableForSale,
        price: { amount: spec.price, currencyCode: "USD" },
        // SAMPLE compare-at price (demo only), mirrored onto every variant.
        compareAtPrice: spec.compareAtPrice
          ? { amount: spec.compareAtPrice, currencyCode: "USD" }
          : null,
        selectedOptions: [
          { name: "Color", value: color },
          { name: "Size", value: size },
        ],
        quantityAvailable: availableForSale ? spec.inventory : 0,
      });
    }
  }

  return variants;
}

function buildMockProduct(spec: MockProductSpec, index: number): Product {
  const variants = buildMockVariants(spec);
  const availableForSale = variants.some((variant) => variant.availableForSale);
  const images = [
    {
      url: `/images/products/p-${spec.handle}.svg`,
      altText: `Illustration of the ${spec.title}`,
    },
    {
      url: `/images/products/p-${spec.handle}-detail.svg`,
      altText: `Fabric detail illustration of the ${spec.title}`,
    },
  ];

  return {
    id: `mock-product-${spec.handle}`,
    handle: spec.handle,
    title: spec.title,
    description: spec.description,
    productType: spec.productType,
    vendor: MOCK_VENDOR,
    tags: spec.tags,
    featuredImage: images[0] ?? null,
    images,
    priceRange: {
      min: { amount: spec.price, currencyCode: "USD" },
      max: { amount: spec.price, currencyCode: "USD" },
    },
    options: [
      { name: "Color", values: spec.colors },
      { name: "Size", values: spec.sizes },
    ],
    variants,
    metafields: {
      fabric: spec.fabric,
      care: spec.care,
      highlights: spec.highlights,
      sizeChart: spec.sizeChart ?? null,
      deliveryNote: spec.deliveryNote ?? null,
      pairsWith: spec.pairsWith,
    },
    availableForSale,
    totalInventory: spec.inventory,
    createdAt: spec.createdAt,
    featuredPosition: index,
    badges: computeBadges({
      tags: spec.tags,
      totalInventory: spec.inventory,
      availableForSale,
    }),
    collections: spec.collections,
  };
}

/** Full mock catalog in merchandising (featured) order. */
export const MOCK_PRODUCTS: readonly Product[] = MOCK_PRODUCT_SPECS.map(buildMockProduct);
