import { Router } from "express";
const router = Router();
import * as subCategoryController from "./subCategory.controller.js";
import asyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";

router.post(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  asyncHandler(subCategoryController.addSubCategory)
);

router.put(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
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
  asyncHandler(subCategoryController.deleteSubCategory)
);

export default router;
