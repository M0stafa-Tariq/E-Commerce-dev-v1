import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as cartController from "./cart.controller.js";
import * as validator from "./cart.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./cart.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_PRODUCT_TO_CART),
  validationMiddleware(validator.addProductToCartSchema),
  asyncHandler(cartController.addProductToCart)
);

router.put(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT_TO_CART),
  validationMiddleware(validator.removeProductFromCartSchema),
  asyncHandler(cartController.removeFromcart)
);

export default router;
