import type {
  Collection,
  Money,
  Product,
  ProductImage,
  ProductVariant,
  SelectedOption,
} from "@/types";
import { computeBadges } from "@/utils";
import { shopifyFetch } from "@/lib/shopify";

/**
 * Shopify Storefront API query documents, response types and mappers.
 *
 * Demo tradeoff (documented, see INSTRUCTIONS.md): the collection/products
 * queries fetch a scoped window (up to 250 nodes) and then reuse the SAME
 * applyProductFilters / applyProductSort / paginateProducts helpers as the mock
 * path, so both paths behave identically. For a large real catalog, push
 * filtering and pagination into the GraphQL query itself (products(query:),
 * products(first, after), sortKey) instead of post-processing in memory.
 */

const MAX_SCOPED_NODES = 250;

const PRODUCT_IMAGE_FRAGMENT = `
  url
  altText
`;

const VARIANT_FRAGMENT = `
  id
  title
  availableForSale
  price {
    amount
    currencyCode
  }
  compareAtPrice {
    amount
    currencyCode
  }
  selectedOptions {
    name
    value
  }
  quantityAvailable
`;

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  productType
  vendor
  tags
  featuredImage {
    ${PRODUCT_IMAGE_FRAGMENT}
  }
  images(first: 10) {
    nodes {
      ${PRODUCT_IMAGE_FRAGMENT}
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  options {
    name
    values
  }
  variants(first: 100) {
    nodes {
      ${VARIANT_FRAGMENT}
    }
  }
  metafields(identifiers: [
    { namespace: "custom", key: "fabric" },
    { namespace: "custom", key: "care" },
    { namespace: "custom", key: "highlights" },
    { namespace: "custom", key: "size_chart" },
    { namespace: "custom", key: "delivery_note" },
    { namespace: "custom", key: "pairs_with" }
  ]) {
    type
    value
  }
  createdAt
  collections(first: 250) {
    nodes {
      handle
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      nodes {
        ${PRODUCT_FRAGMENT}
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FRAGMENT}
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          ${PRODUCT_IMAGE_FRAGMENT}
        }
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        ${PRODUCT_IMAGE_FRAGMENT}
      }
      products {
        totalCount
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          ${PRODUCT_FRAGMENT}
        }
      }
    }
  }
`;

/* ----------------------------- Raw response shapes ----------------------------- */

type RawMoney = { amount: string; currencyCode: string };
type RawImage = { url: string; altText: string | null };
type RawMetafield = { type: string; value: string } | null;
type RawVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: RawMoney;
  compareAtPrice: RawMoney | null;
  selectedOptions: SelectedOption[];
  quantityAvailable: number | null;
};
type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  featuredImage: RawImage | null;
  images: { nodes: RawImage[] };
  priceRange: {
    minVariantPrice: RawMoney;
    maxVariantPrice: RawMoney;
  };
  options: { name: string; values: string[] }[];
  variants: { nodes: RawVariant[] };
  metafields: RawMetafield[];
  createdAt: string;
  collections: { nodes: { handle: string }[] };
};
type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: RawImage | null;
};

/* ---------------------------------- Mappers ---------------------------------- */

function toMoney(raw: RawMoney): Money {
  return { amount: Number.parseFloat(raw.amount), currencyCode: raw.currencyCode };
}

function toImage(raw: RawImage): ProductImage {
  return { url: raw.url, altText: raw.altText ?? "" };
}

function toVariant(raw: RawVariant): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    availableForSale: raw.availableForSale,
    price: toMoney(raw.price),
    compareAtPrice: raw.compareAtPrice ? toMoney(raw.compareAtPrice) : null,
    selectedOptions: raw.selectedOptions,
    quantityAvailable: raw.quantityAvailable,
  };
}

function parseMetafieldString(value: string | null | undefined): string | null {
  if (value == null) return null;
  // String metafields are JSON-encoded; try parsing, fall back to raw.
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "string" ? parsed : value;
  } catch {
    return value;
  }
}

function parseMetafieldList(value: string | null | undefined): string[] | null {
  if (value == null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return null;
  } catch {
    return null;
  }
}

function metafieldAt(metafields: RawMetafield[], index: number): string | null {
  const field = metafields[index];
  return field ? parseMetafieldString(field.value) : null;
}

function toProduct(raw: RawProduct, featuredPosition: number): Product {
  const variants = raw.variants.nodes.map(toVariant);
  const totalInventory = variants.reduce(
    (sum, variant) => sum + (variant.quantityAvailable ?? 0),
    0,
  );
  const availableForSale = variants.some((variant) => variant.availableForSale);
  const tags = raw.tags ?? [];

  // Metafield order matches the identifiers list in PRODUCT_FRAGMENT:
  // 0 fabric, 1 care, 2 highlights, 3 size_chart, 4 delivery_note, 5 pairs_with.
  const metafields = {
    fabric: metafieldAt(raw.metafields, 0),
    care: metafieldAt(raw.metafields, 1),
    highlights: raw.metafields[2] ? parseMetafieldList(raw.metafields[2].value) : null,
    sizeChart: raw.metafields[3] ? parseMetafieldString(raw.metafields[3].value) : null,
    deliveryNote: raw.metafields[4] ? parseMetafieldString(raw.metafields[4].value) : null,
    pairsWith: raw.metafields[5] ? parseMetafieldList(raw.metafields[5].value) : null,
  };

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    productType: raw.productType,
    vendor: raw.vendor,
    tags,
    featuredImage: raw.featuredImage ? toImage(raw.featuredImage) : null,
    images: raw.images.nodes.map(toImage),
    priceRange: {
      min: toMoney(raw.priceRange.minVariantPrice),
      max: toMoney(raw.priceRange.maxVariantPrice),
    },
    options: raw.options,
    variants,
    metafields,
    availableForSale,
    totalInventory,
    createdAt: raw.createdAt,
    featuredPosition,
    badges: computeBadges({ tags, totalInventory, availableForSale }),
    collections: raw.collections.nodes.map((node) => node.handle),
  };
}

function toCollection(raw: RawCollection, productsCount: number): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    image: raw.image ? toImage(raw.image) : null,
    productsCount,
  };
}

/* ------------------------------ Scoped data fetches ------------------------------ */

/**
 * Fetch a scoped window of products (optionally by collection handle) and
 * map them. The returned array is pre-filtered by collection membership on
 * the API side; caller applies further filters/sort/pagination via the shared
 * helpers in product-listing.ts.
 */
export async function fetchProductsScoped(options?: {
  collectionHandle?: string;
  query?: string;
}): Promise<Product[]> {
  const collectionHandle = options?.collectionHandle;
  const query = options?.query;

  if (collectionHandle && collectionHandle !== "all") {
    const data = await shopifyFetch<{
      collection: { products: { nodes: RawProduct[] } } | null;
    }>(COLLECTION_PRODUCTS_QUERY, { handle: collectionHandle, first: MAX_SCOPED_NODES });
    if (!data.collection) {
      return [];
    }
    return data.collection.products.nodes.map((node, index) => toProduct(node, index));
  }

  // For "all" or free-text search: build a Storefront `query` string when a
  // search term is present, else fetch the first window.
  const apiQuery = query?.trim() || undefined;
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>(PRODUCTS_QUERY, {
    first: MAX_SCOPED_NODES,
    query: apiQuery,
  });
  return data.products.nodes.map((node, index) => toProduct(node, index));
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  return data.product ? toProduct(data.product, 0) : null;
}

export async function fetchCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: RawCollection[] } }>(COLLECTIONS_QUERY, {
    first: MAX_SCOPED_NODES,
  });
  // productsCount needs a second hop per collection; keep it lazy-cheap here by
  // counting from the scoped products fetch the caller already makes when needed.
  return data.collections.nodes.map((node) => toCollection(node, 0));
}

export async function fetchCollectionByHandle(
  handle: string,
): Promise<{ collection: Collection; products: Product[] } | null> {
  const data = await shopifyFetch<{
    collection: (RawCollection & { products: { totalCount: number } }) | null;
  }>(COLLECTION_BY_HANDLE_QUERY, { handle });
  if (!data.collection) {
    return null;
  }
  const products = await fetchProductsScoped({ collectionHandle: handle });
  return {
    collection: toCollection(data.collection, data.collection.products.totalCount),
    products,
  };
}
