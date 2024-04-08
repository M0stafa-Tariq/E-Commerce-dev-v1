import { Router } from "express";
const router = Router();

import * as subCategoryController from "./subCategory.controller.js";
import * as validator from "./subCategory.validation-schemas.js";

import asyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

router.post(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.addSubCategorySchema),
  asyncHandler(subCategoryController.addSubCategory)
);

router.put(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.updateSubCategorySchema),
  asyncHandler(subCategoryController.updateSubCategory)
);

router.get(
  "/",
  auth(endPointsRoles.GET_CATEGORIES),
  asyncHandler(subCategoryController.getAllSubCategoriesWithBrands)
);

router.delete(
  "/:subCategoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(validator.deleteSubCategorySchema),
  asyncHandler(subCategoryController.deleteSubCategory)
);

router.get(
  "/:subCategoryId",
  validationMiddleware(validator.getSubCategoryByIdSchema),
  asyncHandler(subCategoryController.getSubCategoryById)
);

router.get(
  "/allBrands/:subCategoryId",
  validationMiddleware(validator.getAllBrandsForSpecificSubCategorySchema),
  asyncHandler(subCategoryController.getAllBrandsForSpecificSubCategory)
);

export default router;
