import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as productController from "./product.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints.js";
import { multerMiddleHost } from "../../middlewares/multer.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({}).array("image", 3),
  asyncHandler(productController.addProduct)
);

router.put(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({}).single("image"),
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT),
  asyncHandler(productController.deleteProduct)
);

router.get(
  "/search/:productId",
  asyncHandler(productController.getProductById)
);

router.get(
  "/",
  asyncHandler(productController.getAllProductsPaginated)
);

router.get(
  "/search",
  asyncHandler(productController.searchProduct)
);

router.get(
  "/brand",
  asyncHandler(productController.allProductForTwoBrands)
);



export default router;
