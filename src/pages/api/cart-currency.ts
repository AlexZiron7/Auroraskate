import type { APIRoute } from "astro";

const SHOP_DOMAIN =
  (import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN as string) ||
  (import.meta.env.SHOPIFY_STORE_DOMAIN as string);

const SFY_TOKEN =
  (import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string) ||
  (import.meta.env.SHOPIFY_STOREFRONT_TOKEN as string);

const SFY_API = (import.meta.env.SHOPIFY_STOREFRONT_API_VERSION as string) || "2024-01";

// Mapea moneda -> país (Shopify decide moneda por país según Markets)
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US",
  EUR: "ES",
  MXN: "MX",
};

const MUTATION = /* GraphQL */ `
mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
  cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
    cart { id cost { totalAmount { amount currencyCode } } }
    userErrors { field message }
  }
}
`;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { currency } = await request.json();
    const countryCode = CURRENCY_TO_COUNTRY[currency] || "US";

    // cookie para que tus consultas puedan usar @inContext(country: ...)
    cookies.set("buyerCountry", countryCode, { path: "/", httpOnly: false });

    const cartId = cookies.get("cartId")?.value;
    if (!cartId) {
      // sin carrito aún -> con la cookie basta; el próximo cartCreate heredará el país
      return new Response(JSON.stringify({ ok: true, updated: false }), { status: 200 });
    }

    const res = await fetch(`https://${SHOP_DOMAIN}/api/${SFY_API}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SFY_TOKEN,
      },
      body: JSON.stringify({
        query: MUTATION,
        variables: { cartId, buyerIdentity: { countryCode } },
      }),
    });

    const data = await res.json();
    const userErrors = data?.data?.cartBuyerIdentityUpdate?.userErrors || data?.errors;
    if (userErrors?.length) {
      return new Response(JSON.stringify({ ok: false, userErrors }), { status: 400 });
    }
    return new Response(JSON.stringify({ ok: true, data: data?.data }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
};
