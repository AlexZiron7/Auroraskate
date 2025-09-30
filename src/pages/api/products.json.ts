import type { APIRoute } from "astro";
import { getProducts } from "@/lib/woocommerce";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const per_page = parseInt(url.searchParams.get("per_page") || "20");
  const sortKey = url.searchParams.get("sortKey") || "date";
  const order = url.searchParams.get("reverse") === "true" ? "desc" : "asc";
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";

  try {
    const { products, pageInfo } = await getProducts({
      page,
      per_page,
      orderby: sortKey,
      order,
      search,
      category,
    });

    return new Response(JSON.stringify({ products, pageInfo }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
