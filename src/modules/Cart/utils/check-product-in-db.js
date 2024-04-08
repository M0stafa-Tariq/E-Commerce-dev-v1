import Product from "../../../../DB/Models/product.model.js";

/**
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Product | null>}
 * @description check if product exists and if it's available
 */

export async function checkProductAvailability(productId, quantity) {
  const product = await Product.findById(productId);

  if (!product || product.stock < quantity) return null;

  return product;
}
