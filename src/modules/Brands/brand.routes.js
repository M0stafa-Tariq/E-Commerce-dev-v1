import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as brandController from "./brand.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./brand.endpoints.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  multerMiddleHost({}).single("image"),
  asyncHandler(brandController.addBrand)
);

router.put(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  multerMiddleHost({}).single("image"),
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
  asyncHandler(brandController.deleteBrand)
);

export default router;
