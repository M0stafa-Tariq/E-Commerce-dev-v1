import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as brandController from "./brand.controller.js";
import * as validator from "./brand.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./brand.endpoints.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.addBrandSchema),
  asyncHandler(brandController.addBrand)
);

router.put(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.updateBrandSchema),
  asyncHandler(brandController.updateBrand)
);

router.get(
  "/",
  auth(endPointsRoles.GET_BRANDS),
  asyncHandler(brandController.getAllBrands)
);

router.delete(
  "/:brandId",
  auth(endPointsRoles.DELETE_BRAND),
  validationMiddleware(validator.deleteBrandSchema),
  asyncHandler(brandController.deleteBrand)
);

export default router;
