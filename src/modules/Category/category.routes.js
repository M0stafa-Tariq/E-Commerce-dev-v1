import { Router } from "express";
const router = Router();
import * as categoryController from "./category.controller.js";
import * as validator from "./category.validation-schemas.js";

import asyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "./category.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

router.post(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.addCategorySchema),
  asyncHandler(categoryController.addCategory)
);

router.put(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  validationMiddleware(validator.updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

router.get(
  "/",
  asyncHandler(categoryController.getAllCategoriesWithSubCategoriesWithBrands)
);

router.delete(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(validator.deleteCategorySchema),
  asyncHandler(categoryController.deleteCategory)
);

router.get(
  "/all",
  asyncHandler(
    categoryController.getAllCategoriesWithSubCategoriesWithBrandsWithProducts
  )
);

router.get(
  "/subCategory/:categoryId",
  asyncHandler(categoryController.getAllSubCategoryForSpecificCategory)
);

router.get(
  "/:categoryId",
  validationMiddleware(validator.getCategoryByIdSchema),
  asyncHandler(categoryController.getCategoryById)
);

router.get(
  "/allBrands/:categoryId",
  validationMiddleware(validator.getAllBrandsForSpecificCategorySchema),
  asyncHandler(categoryController.getAllBrandsForSpecificCategory)
);

export default router;
