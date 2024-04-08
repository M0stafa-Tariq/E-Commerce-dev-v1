import { checkProductIfExistsInCart } from "./check-product-in-cart.js";

/**
 * 
 * @param {Cart type} cart 
 * @param {String} productId 
 * @param {Number} quantity 
 * @returns  {Promise<Cart | null>}
 * @description update product quantity , final Price and subTotal in cart
 */

  export async function updateProductQuantity(cart, productId, quantity) {
    const isProductExistInCart = await checkProductIfExistsInCart(cart, productId)
    if (!isProductExistInCart) return null

    cart?.products.forEach(product => {
        if (product.productId.toString() === productId) {
            product.quantity = quantity
            product.finalPrice = product.basePrice * quantity
        }
    })
    return cart.products

}