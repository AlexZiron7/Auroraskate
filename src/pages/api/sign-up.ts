import { createCustomer } from "@/lib/woocommerce";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password || !firstName) {
      return new Response("Email, password and first name are required", { status: 400 });
    }

    // Create customer via WooCommerce API
    const { customer, customerCreateErrors } = await createCustomer({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    if (customerCreateErrors && customerCreateErrors.length > 0) {
      return new Response(JSON.stringify({ errors: customerCreateErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = new Response(JSON.stringify({ customer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    return response;
  } catch (error: any) {
    console.error("Error in API:", error);
    return new Response(
      JSON.stringify({
        errors: [
          {
            code: "INTERNAL_ERROR",
            message: error.message || "An unknown error occurred",
          },
        ],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
