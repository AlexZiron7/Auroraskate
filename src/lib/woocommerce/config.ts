// WooCommerce Configuration
export const WOOCOMMERCE_API_URL = import.meta.env.PUBLIC_WOOCOMMERCE_API_URL || '';
export const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '';
export const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '';
export const WOOCOMMERCE_STORE_URL = import.meta.env.PUBLIC_WOOCOMMERCE_STORE_URL || '';

// Validate environment variables
if (!WOOCOMMERCE_STORE_URL) {
  throw new Error('PUBLIC_WOOCOMMERCE_STORE_URL is not set in your environment variables.');
}

if (!WOOCOMMERCE_CONSUMER_KEY) {
  throw new Error('PUBLIC_WOOCOMMERCE_CONSUMER_KEY is not set in your environment variables.');
}

if (!WOOCOMMERCE_CONSUMER_SECRET) {
  throw new Error('PUBLIC_WOOCOMMERCE_CONSUMER_SECRET is not set in your environment variables.');
}

// Build API endpoint
export const API_ENDPOINT = WOOCOMMERCE_API_URL || `${WOOCOMMERCE_STORE_URL}/wp-json/wc/v3`;
export const STORE_API_ENDPOINT = `${WOOCOMMERCE_STORE_URL}/wp-json/wc/store/v1`;

// API Configuration
export const API_CONFIG = {
  endpoint: API_ENDPOINT,
  storeEndpoint: STORE_API_ENDPOINT,
  consumerKey: WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3',
};

// Cart Configuration
export const CART_COOKIE_NAME = 'wc_cart_hash';
export const CART_KEY_COOKIE_NAME = 'wc_cart_key';

// Tags for caching
export const TAGS = {
  cart: 'cart',
  products: 'products',
  categories: 'categories',
  collections: 'collections',
  orders: 'orders',
};

export const HIDDEN_PRODUCT_TAG = 'hidden';