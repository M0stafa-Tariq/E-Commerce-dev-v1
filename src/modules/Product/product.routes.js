import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as productController from "./product.controller.js";
import * as validator from "./product.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({}).array("image", 3),
  validationMiddleware(validator.addProductSchema),
  asyncHandler(productController.addProduct)
);

router.put(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.updateProductSchema),
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT),
  validationMiddleware(validator.deleteProductSchema),
  asyncHandler(productController.deleteProduct)
);

router.get(
  "/search/:productId",
  validationMiddleware(validator.getProductByIdSchema),
  asyncHandler(productController.getProductById)
);

router.get(
  "/",
  validationMiddleware(validator.getAllProductsPaginatedSchema),
  asyncHandler(productController.getAllProductsPaginated)
);

router.get(
  "/search",
  validationMiddleware(validator.searchProductSchema),
  asyncHandler(productController.searchProduct)
);

router.get(
  "/brand",
  validationMiddleware(validator.allProductForTwoBrandsSchema),
  asyncHandler(productController.allProductForTwoBrands)
);

export default router;
