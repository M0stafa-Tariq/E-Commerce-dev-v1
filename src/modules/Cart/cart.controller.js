import Cart from "../../../DB/Models/cart.model.js";
import { addCart } from "./utils/add-cart.js";
import { pushNewProduct } from "./utils/add-product-to-cart.js";
import { calculateSubTotal } from "./utils/calculate-subtotal.js";
import { checkProductAvailability } from "./utils/check-product-in-db.js";
import { getUserCart } from "./utils/get-user-cart.js";
import { updateProductQuantity } from "./utils/update-product-quantity.js";

//======================================== add product to cart =======================================//
export const addProductToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { _id } = req.authUser;

  /**
   * @check if the product exists and if it's available
   */
  const product = await checkProductAvailability(productId, quantity);
  if (!product)
    return next({ message: "Product not found or not available", cause: 404 });

  /**
   * @check if the user has a cart
   */
  const userCart = await getUserCart(_id);

  /**
   * @check if the user has no cart, create a new cart and add the product to it
   */
  if (!userCart) {
    const newCart = await addCart(_id, product, quantity);
    return res
      .status(201)
      .json({ message: "Product added to cart successfully", data: newCart });
  }

  /**
   * @returns The cart state after modifying its products array to reflect the updated quantities and subtotals.
   * @check if the returned value is null, then the product is not found in the cart and we will add it.
   */
  let newCartProducts = await updateProductQuantity(
    userCart,
    productId,
    quantity
  );
  if (!newCartProducts) {
    newCartProducts = await pushNewProduct(userCart, product, quantity);
  }
  /**
   * update the userCart products with the newCartProducts
   * we can remove the calculation of the subtotal from the functions and call it here once.
   */
  userCart.products = newCartProducts;
  userCart.subTotal = calculateSubTotal(userCart.products);

  await userCart.save();
  res
    .status(201)
    .json({ message: "Product added to cart successfully", data: userCart });
};

//=========================================== remove product from cart ===================================//
/**
 * @param { productId } from req.params
 * @param { userId } from req.authUser
 * @description  Update the cart by removing the specified product from the user's cart.
 */

export const removeFromcart = async (req, res, next) => {
  const { productId } = req.params;
  const { _id } = req.authUser;

  /**
   * @todo you can handle it using the dbMethods
   * @check if the product exists in the user's cart
   */
  const userCart = await Cart.findOne({
    userId: _id,
    "products.productId": productId,
  });
  if (!userCart)
    return next({ message: "Product not found in cart", cause: 404 });

  /** @returns the resulting state of the userCart.products array, after removing the specified product from the user's cart */
  userCart.products = userCart.products.filter(
    (product) => product.productId.toString() !== productId
  );

  /**@returns the calculated subtotal after update the cart's products array. */
  userCart.subTotal = calculateSubTotal(userCart.products);

  const newCart = await userCart.save();

  /**@check If the cart's products array is empty we will delete the cart. */
  if (newCart.products.length === 0) {
    await Cart.findByIdAndDelete(newCart._id);
  }

  res.status(201).json({ message: "Product delete to cart successfully" });
};
