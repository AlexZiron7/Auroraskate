// WooCommerce Types
export type Maybe<T> = T | null;

export interface WooCustomerInput {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  username?: string;
}

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing?: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
  totals: {
    subtotal: string;
    total: string;
    tax: string;
    currency_code: string;
    currency_symbol: string;
  };
  totalQuantity: number;
  checkoutUrl: string;
};

export type CartItem = {
  id: string;
  key: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  name: string;
  price: string;
  totals: {
    line_subtotal: string;
    line_total: string;
    line_tax: string;
  };
  images: Image[];
  variation: Array<{
    attribute: string;
    value: string;
  }>;
  product: Product;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: Image;
  count: number;
};

export type Collection = Category & {
  path: string;
};

export type Image = {
  id: number;
  src: string;
  url: string;
  alt: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    maxVariantPrice: Money;
  };
  on_sale: boolean;
  stock_status: string;
  availableForSale: boolean;
  categories: Category[];
  collections: Category[];
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Image[];
  featuredImage: Image;
  attributes: ProductAttribute[];
  options: ProductOption[];
  variations: ProductVariant[];
  variants: ProductVariant[];
  vendor: string;
  seo: SEO;
  updatedAt: string;
  date_modified: string;
};

export type ProductAttribute = {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: number;
  title: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  availableForSale: boolean;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
    value: string;
  }>;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: Image;
};

export type SEO = {
  title: string;
  description: string;
};

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
};

export type Page = {
  id: number;
  title: string;
  slug: string;
  handle: string;
  content: string;
  body: string;
  excerpt: string;
  bodySummary: string;
  date: string;
  modified: string;
  createdAt: string;
  updatedAt: string;
  seo?: SEO;
};

export type Menu = {
  title: string;
  path: string;
  url?: string;
};

// API Response Types
export type WooCommerceError = {
  code: string;
  message: string;
  data?: {
    status: number;
  };
};

export type WooCommerceResponse<T> = {
  data?: T;
  error?: WooCommerceError;
  headers?: Headers;
};
