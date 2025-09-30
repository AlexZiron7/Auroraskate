export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "date" | "popularity" | "price" | "rating";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "Relevance",
  slug: null,
  sortKey: "date",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "Trending",
    slug: "trending-desc",
    sortKey: "popularity",
    reverse: false,
  },
  {
    title: "Latest arrivals",
    slug: "latest-desc",
    sortKey: "date",
    reverse: true,
  },
  {
    title: "Price: Low to high",
    slug: "price-asc",
    sortKey: "price",
    reverse: false,
  },
  {
    title: "Price: High to low",
    slug: "price-desc",
    sortKey: "price",
    reverse: true,
  },
];

export const TAGS = {
  collections: "collections",
  categories: "categories",
  products: "products",
  cart: "cart",
};

export const HIDDEN_PRODUCT_TAG = "hidden";
export const DEFAULT_OPTION = "Default Title";
