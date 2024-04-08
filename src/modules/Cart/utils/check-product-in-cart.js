/**
 * @param {Cart Type} cart 
 * @param {String} productId 
 * @returns  {Promise<Boolean>}
 * @description check if product exists in cart
 */

export async function checkProductIfExistsInCart(cart, productId) {

    return cart.products.some(
        (product) => product.productId.toString() === productId
    )

}