import Cart from "../../../../DB/Models/cart.model.js";
/**
 * 
 * @param {String} userId 
 * @returns  {Promise<Cart | null>}
 * @description  Get the user's cart
 */

export async function getUserCart (userId){
    const userCart = await Cart.findOne({userId})
    return userCart
}