import type { APIRoute } from "astro";

// WooCommerce currency configuration
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US",
  EUR: "ES",
  MXN: "MX",
  GBP: "GB",
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { currency } = await request.json();
    const countryCode = CURRENCY_TO_COUNTRY[currency] || "ES";

    // Store currency preference in cookie
    cookies.set("wc_currency", currency, { path: "/", httpOnly: false });
    cookies.set("wc_country", countryCode, { path: "/", httpOnly: false });

    // WooCommerce handles currency through its own settings
    // This endpoint just stores user preference
    return new Response(
      JSON.stringify({
        ok: true,
        currency,
        countryCode,
        message: "Currency preference saved"
      }),
      { status: 200 }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500 }
    );
  }
};
