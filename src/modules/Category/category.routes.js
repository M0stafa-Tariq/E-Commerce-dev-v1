import { Router } from "express";
const router = Router();
import * as categoryController from "./category.controller.js";
import asyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "./category.endpoints.js";

router.post(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  asyncHandler(categoryController.addCategory)
);

router.put(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({}).single("image"),
  asyncHandler(categoryController.updateCategory)
);

router.get("/", asyncHandler(categoryController.getAllCategories));

router.delete(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  asyncHandler(categoryController.deleteCategory)
);

export default router;
