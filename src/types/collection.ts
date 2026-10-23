import type { ProductImage } from "./product";

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
  productsCount: number;
};
