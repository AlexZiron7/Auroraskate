import { API_CONFIG, TAGS, HIDDEN_PRODUCT_TAG, STORE_API_ENDPOINT } from './config';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, USE_MOCK_DATA } from './mock-data';
import type {
  Product,
  Category,
  Collection,
  Cart,
  CartItem,
  User,
  WooCustomerInput,
  PageInfo,
  Page,
  Menu,
  Image,
  Money,
  ProductVariant,
} from './types';

// Generic fetch function for WooCommerce Store API (no auth required)
async function wooFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let url: string;

  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else {
    // Convert REST API paths to Store API paths
    let storeEndpoint = endpoint;
    if (endpoint.startsWith('/products/categories')) {
      storeEndpoint = endpoint.replace('/products/categories', '/wc/store/v1/products/categories');
    } else if (endpoint.startsWith('/products')) {
      storeEndpoint = endpoint.replace('/products', '/wc/store/v1/products');
    }

    // Build full URL
    const baseUrl = API_CONFIG.endpoint.replace('/wc/v3', '');
    url = `${baseUrl}${storeEndpoint}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('WooCommerce API Error:', error);
    throw error;
  }
}

// Store API fetch (for cart operations - doesn't need auth)
async function storeApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STORE_API_ENDPOINT}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('WooCommerce Store API Error:', error);
    throw error;
  }
}

// Transform WooCommerce image to our format
function transformImage(image: any): Image {
  return {
    id: image.id || 0,
    src: image.src || image.url || image.thumbnail || '',
    url: image.src || image.url || image.thumbnail || '',
    alt: image.alt || image.name || '',
    altText: image.alt || image.name || '',
    width: image.width || 0,
    height: image.height || 0,
  };
}

// Transform WooCommerce product to our format
function transformProduct(product: any): Product {
  const images = product.images?.map(transformImage) || [];
  const featuredImage = images[0] || {
    id: 0,
    src: '',
    url: '',
    alt: product.name,
    altText: product.name,
    width: 0,
    height: 0,
  };

  // Transform variations
  const variants: ProductVariant[] = product.variations?.map((v: any) => ({
    id: v.id,
    title: v.attributes?.map((a: any) => a.option).join(' / ') || 'Default',
    price: v.price || v.prices?.price,
    regular_price: v.regular_price || v.prices?.regular_price,
    sale_price: v.sale_price || v.prices?.sale_price,
    stock_status: v.stock_status || (v.is_in_stock ? 'instock' : 'outofstock'),
    availableForSale: v.stock_status === 'instock' || v.is_in_stock,
    attributes: v.attributes || [],
    selectedOptions: v.attributes?.map((a: any) => ({
      name: a.name,
      value: a.option,
    })) || [],
    image: v.image ? transformImage(v.image) : undefined,
  })) || [];

  // Transform attributes to options
  const options = product.attributes?.map((attr: any) => ({
    id: attr.id?.toString() || attr.attribute_id?.toString() || '0',
    name: attr.name || attr.attribute,
    values: attr.options || attr.terms || [],
  })) || [];

  // Handle Store API price format
  const priceValue = product.prices?.price || product.price || product.regular_price || '0';
  const regularPriceValue = product.prices?.regular_price || product.regular_price || priceValue;
  const salePriceValue = product.prices?.sale_price || product.sale_price || '';

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    handle: product.slug,
    title: product.name,
    description: product.description?.replace(/<[^>]*>/g, '') || '',
    descriptionHtml: product.description || '',
    short_description: product.short_description || '',
    price: priceValue,
    regular_price: regularPriceValue,
    sale_price: salePriceValue,
    priceRange: {
      minVariantPrice: {
        amount: priceValue,
        currencyCode: 'EUR',
      },
      maxVariantPrice: {
        amount: regularPriceValue,
        currencyCode: 'EUR',
      },
    },
    compareAtPriceRange: {
      maxVariantPrice: {
        amount: regularPriceValue,
        currencyCode: 'EUR',
      },
    },
    on_sale: product.on_sale || false,
    stock_status: product.stock_status || (product.is_in_stock ? 'instock' : 'outofstock'),
    availableForSale: product.stock_status === 'instock' || product.is_in_stock || product.is_purchasable,
    categories: product.categories || [],
    collections: product.categories || [],
    tags: product.tags || [],
    images,
    featuredImage,
    attributes: product.attributes || [],
    options,
    variations: variants,
    variants,
    vendor: product.vendor || '',
    seo: {
      title: product.name,
      description: product.short_description || product.description || '',
    },
    updatedAt: product.date_modified || product.date_created,
    date_modified: product.date_modified || product.date_created,
  };
}

// ============= PRODUCT FUNCTIONS =============

export async function getProducts({
  page = 1,
  per_page = 20,
  search = '',
  category = '',
  tag = '',
  orderby = 'date',
  order = 'desc',
}: {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  tag?: string;
  orderby?: string;
  order?: string;
} = {}): Promise<{ products: Product[]; pageInfo: PageInfo }> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
    orderby,
    order,
  });

  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (tag) params.append('tag', tag);

  const url = `${API_CONFIG.endpoint.replace('/wc/v3', '/wc/store/v1')}/products?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error('Failed to fetch products:', response.status, response.statusText);
    return {
      products: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        total: 0,
        totalPages: 0,
        currentPage: 1,
      },
    };
  }

  const products = await response.json();

  // Check if products is an array
  if (!Array.isArray(products)) {
    console.error('Products response is not an array:', products);
    return {
      products: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        total: 0,
        totalPages: 0,
        currentPage: 1,
      },
    };
  }

  const total = parseInt(response.headers.get('X-WP-Total') || '0');
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

  return {
    products: products.map(transformProduct),
    pageInfo: {
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      total,
      totalPages,
      currentPage: page,
    },
  };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const products = await wooFetch<any[]>(`/products?slug=${slug}`);
    if (products.length === 0) return undefined;

    // Get product with variations
    const productWithVariations = await wooFetch<any>(`/products/${products[0].id}`);

    // If product has variations, fetch them
    if (productWithVariations.variations && productWithVariations.variations.length > 0) {
      const variationsPromises = productWithVariations.variations.map((varId: number) =>
        wooFetch<any>(`/products/${products[0].id}/variations/${varId}`)
      );
      const variations = await Promise.all(variationsPromises);
      productWithVariations.variations = variations;
    }

    return transformProduct(productWithVariations);
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
}

export async function getProductRecommendations(
  productId: number
): Promise<Product[]> {
  try {
    // Get related products by category
    const product = await wooFetch<any>(`/products/${productId}`);
    if (!product.categories || product.categories.length === 0) return [];

    const categoryId = product.categories[0].id;
    const products = await wooFetch<any[]>(
      `/products?category=${categoryId}&per_page=4&exclude=${productId}`
    );

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    return [];
  }
}

export async function getHighestProductPrice(): Promise<Money | null> {
  try {
    const products = await wooFetch<any[]>(
      '/products?orderby=price&order=desc&per_page=1'
    );
    if (products.length === 0) return null;

    return {
      amount: products[0].price,
      currencyCode: 'EUR',
    };
  } catch (error) {
    console.error('Error fetching highest price:', error);
    return null;
  }
}

// ============= CATEGORY FUNCTIONS =============

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await wooFetch<any[]>('/products/categories?per_page=100');
    return categories
      .filter((cat) => !cat.slug.startsWith('hidden') && cat.slug !== 'uncategorized')
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.image ? transformImage(cat.image) : undefined,
        count: cat.count || 0,
      }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCollections(): Promise<Collection[]> {
  const categories = await getCategories();
  return categories.map((cat) => ({
    ...cat,
    path: `/products?category=${cat.slug}`,
  }));
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  try {
    const categories = await wooFetch<any[]>(`/products/categories?slug=${slug}`);
    if (categories.length === 0) return undefined;

    const cat = categories[0];
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image ? transformImage(cat.image) : undefined,
      count: cat.count || 0,
      path: `/products?category=${cat.slug}`,
    };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return undefined;
  }
}

export async function getCollectionProducts({
  collection,
  page = 1,
  per_page = 20,
  orderby = 'date',
  order = 'desc',
}: {
  collection: string;
  page?: number;
  per_page?: number;
  orderby?: string;
  order?: string;
}): Promise<{ products: Product[]; pageInfo: PageInfo }> {
  try {
    // Get category by slug
    const categories = await wooFetch<any[]>(`/products/categories?slug=${collection}`);
    if (categories.length === 0) {
      return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, total: 0, totalPages: 0, currentPage: 1 } };
    }

    const categoryId = categories[0].id;
    return getProducts({ page, per_page, category: categoryId.toString(), orderby, order });
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return { products: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, total: 0, totalPages: 0, currentPage: 1 } };
  }
}

// ============= CART FUNCTIONS =============

export async function createCart(): Promise<Cart> {
  try {
    const cart = await storeApiFetch<any>('/cart');
    return transformCart(cart);
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

export async function getCart(cartKey?: string): Promise<Cart | undefined> {
  try {
    const cart = await storeApiFetch<any>('/cart');
    return transformCart(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return undefined;
  }
}

export async function addToCart(
  productId: number,
  quantity: number = 1,
  variationId?: number
): Promise<Cart> {
  try {
    const body: any = {
      id: productId,
      quantity,
    };

    if (variationId) {
      body.variation = [{ attribute: '', value: variationId.toString() }];
    }

    const cart = await storeApiFetch<any>('/cart/add-item', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return transformCart(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function removeFromCart(itemKey: string): Promise<Cart> {
  try {
    const cart = await storeApiFetch<any>(`/cart/remove-item`, {
      method: 'POST',
      body: JSON.stringify({ key: itemKey }),
    });

    return transformCart(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

export async function updateCart(
  itemKey: string,
  quantity: number
): Promise<Cart> {
  try {
    const cart = await storeApiFetch<any>(`/cart/update-item`, {
      method: 'POST',
      body: JSON.stringify({ key: itemKey, quantity }),
    });

    return transformCart(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

function transformCart(cart: any): Cart {
  const items: CartItem[] = cart.items?.map((item: any) => {
    const product = item.product || {};
    return {
      id: item.key,
      key: item.key,
      product_id: item.id,
      variation_id: item.variation_id || 0,
      quantity: item.quantity,
      name: item.name,
      price: item.prices?.price || '0',
      totals: {
        line_subtotal: item.totals?.line_subtotal || '0',
        line_total: item.totals?.line_total || '0',
        line_tax: item.totals?.line_tax || '0',
      },
      images: item.images?.map(transformImage) || [],
      variation: item.variation || [],
      product: {
        ...product,
        id: item.id,
        handle: item.slug || '',
        title: item.name,
      },
    };
  }) || [];

  return {
    id: cart.cart_key || 'default',
    items,
    totals: {
      subtotal: cart.totals?.total_items || '0',
      total: cart.totals?.total_price || '0',
      tax: cart.totals?.total_tax || '0',
      currency_code: cart.totals?.currency_code || 'EUR',
      currency_symbol: cart.totals?.currency_symbol || '€',
    },
    totalQuantity: cart.items_count || 0,
    checkoutUrl: `${API_CONFIG.endpoint.replace('/wp-json/wc/v3', '')}/checkout`,
  };
}

// ============= USER FUNCTIONS =============

export async function createCustomer(input: WooCustomerInput): Promise<any> {
  try {
    const customer = await wooFetch<any>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name || '',
        username: input.username || input.email.split('@')[0],
        password: input.password,
      }),
    });

    return { customer, customerCreateErrors: [] };
  } catch (error: any) {
    return {
      customer: null,
      customerCreateErrors: [{ message: error.message, code: 'ERROR' }],
    };
  }
}

export async function getUserDetails(token: string): Promise<User | null> {
  try {
    // This would require JWT authentication plugin in WordPress
    // For now, return null - implement when WordPress JWT is configured
    console.warn('getUserDetails requires JWT authentication plugin in WordPress');
    return null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// ============= VENDOR FUNCTIONS =============

export async function getVendors(): Promise<{ vendor: string; productCount: number }[]> {
  try {
    const products = await wooFetch<any[]>('/products?per_page=100');
    const vendorMap = new Map<string, number>();

    products.forEach((product) => {
      const vendor = product.vendor || 'Unknown';
      vendorMap.set(vendor, (vendorMap.get(vendor) || 0) + 1);
    });

    return Array.from(vendorMap.entries()).map(([vendor, productCount]) => ({
      vendor,
      productCount,
    }));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

// ============= TAG FUNCTIONS =============

export async function getTags(): Promise<string[]> {
  try {
    const tags = await wooFetch<any[]>('/products/tags?per_page=100');
    return tags.map((tag) => tag.name);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// ============= MENU FUNCTIONS =============

export async function getMenu(handle: string): Promise<Menu[]> {
  // WordPress menus require a separate REST API endpoint or custom implementation
  // For now, return empty array - implement when WordPress menu endpoint is available
  console.warn('getMenu requires WordPress REST API menu endpoint');
  return [];
}

// ============= PAGE FUNCTIONS =============

export async function getPages(): Promise<Page[]> {
  try {
    const response = await fetch(`${API_CONFIG.endpoint.replace('/wc/v3', '/wp/v2')}/pages`);
    const pages = await response.json();

    return pages.map((page: any) => ({
      id: page.id,
      title: page.title.rendered,
      slug: page.slug,
      handle: page.slug,
      content: page.content.rendered,
      body: page.content.rendered,
      excerpt: page.excerpt.rendered,
      bodySummary: page.excerpt.rendered,
      date: page.date,
      modified: page.modified,
      createdAt: page.date,
      updatedAt: page.modified,
      seo: {
        title: page.title.rendered,
        description: page.excerpt.rendered,
      },
    }));
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function getPage(handle: string): Promise<Page | undefined> {
  try {
    const response = await fetch(
      `${API_CONFIG.endpoint.replace('/wc/v3', '/wp/v2')}/pages?slug=${handle}`
    );
    const pages = await response.json();

    if (pages.length === 0) return undefined;

    const page = pages[0];
    return {
      id: page.id,
      title: page.title.rendered,
      slug: page.slug,
      handle: page.slug,
      content: page.content.rendered,
      body: page.content.rendered,
      excerpt: page.excerpt.rendered,
      bodySummary: page.excerpt.rendered,
      date: page.date,
      modified: page.modified,
      createdAt: page.date,
      updatedAt: page.modified,
      seo: {
        title: page.title.rendered,
        description: page.excerpt.rendered,
      },
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return undefined;
  }
}
