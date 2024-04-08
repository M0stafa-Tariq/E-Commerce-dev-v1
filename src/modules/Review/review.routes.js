import { Router } from "express";
const router = Router();
import expressAsyncHandler from "express-async-handler";

import * as reviewController from "./review.controller.js";
import * as reviewValidator from "./review.validation-schemas.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./review.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

router.post(
  "/:productId",
  auth(endPointsRoles.ADD_REVIEW),
  validationMiddleware(reviewValidator.addReviewSchema),
  expressAsyncHandler(reviewController.addReview)
);

router.get(
  "/:productId",
  validationMiddleware(reviewValidator.getAllReviewsForSpecificProductSchema),
  expressAsyncHandler(reviewController.getAllReviewsForSpecificProduct)
);

router.delete(
  "/:reviewId",
  auth(endPointsRoles.DELETE_REVIEW),
  validationMiddleware(reviewValidator.deleteReview),
  expressAsyncHandler(reviewController.deleteReview)
);

export default router;
