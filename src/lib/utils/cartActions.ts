import Cookies from "js-cookie";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/woocommerce";

export async function addItem(selectedVariantId: string | undefined) {
  let cart = await getCart();

  if (!cart) {
    cart = await createCart();
  }

  if (!selectedVariantId) {
    return "Missing product variant ID";
  }

  try {
    // Parse variant ID - format: "productId" or "productId-variationId"
    const parts = selectedVariantId.split('-');
    const productId = parseInt(parts[0]);
    const variationId = parts.length > 1 ? parseInt(parts[1]) : undefined;

    await addToCart(productId, 1, variationId);
  } catch (e) {
    console.error("Error adding item to cart:", e);
    return "Error adding item to cart";
  }
}

export async function removeItem(itemKey: string) {
  try {
    await removeFromCart(itemKey);
  } catch (e) {
    console.error("Error removing item from cart:", e);
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(payload: {
  lineId: string;
  variantId: string;
  quantity: number;
}) {
  const { lineId, quantity } = payload;

  try {
    if (quantity === 0) {
      await removeFromCart(lineId);
      return;
    }

    await updateCart(lineId, quantity);
  } catch (e) {
    console.error("Error updating item quantity:", e);
    return "Error updating item quantity";
  }
}
