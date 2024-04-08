import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as userController from "./user.controller.js";
import * as validator from "./user.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
const router = Router();

router.put(
  "/",
  auth(endPointsRoles.UPDATE_USER),
  validationMiddleware(validator.updateUserSchema),
  asyncHandler(userController.updateUser)
);
router.delete(
  "/",
  auth(endPointsRoles.DELETE_USER),
  validationMiddleware(validator.deleteUserSchema),
  asyncHandler(userController.deleteUser)
);
router.get(
  "/",
  auth(endPointsRoles.GET_PROFILE_DATA),
  asyncHandler(userController.getProfileData)
);
router.patch(
  "/",
  auth(endPointsRoles.DELETE_USER),
  validationMiddleware(validator.deleteUserSchema),
  asyncHandler(userController.softDeleteUser)
);

export default router;
