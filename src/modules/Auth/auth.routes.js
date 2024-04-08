import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as authController from "./auth.controller.js";
import * as validator from "./auth.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./auth.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
const router = Router();

router.post(
  "/",
  validationMiddleware(validator.signUpSchema),
  asyncHandler(authController.signUp)
);
router.get(
  "/verify-email",
  validationMiddleware(validator.verifyEmailSchema),
  asyncHandler(authController.verifyEmail)
);

router.post(
  "/login",
  validationMiddleware(validator.signInSchema),
  asyncHandler(authController.signIn)
);

router.post(
  "/forget",
  validationMiddleware(validator.forgetPasswordSchema),
  asyncHandler(authController.forgetPassword)
);
router.post(
  "/reset/:token",
  validationMiddleware(validator.resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

router.post(
  "/updatePassword",
  auth(endPointsRoles.UPDATE_PASSWORD),
  validationMiddleware(validator.updatePasswordSchema),
  asyncHandler(authController.updatePassword)
);

export default router;
