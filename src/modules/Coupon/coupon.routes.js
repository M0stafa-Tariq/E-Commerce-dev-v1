import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as couponController from "./coupon.controller.js";
import * as validators from "./coupon.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endpointsRoles } from "./coupon.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
const router = Router();

router.post(
  "/",
  auth(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(validators.addCouponSchema),
  expressAsyncHandler(couponController.addCoupon)
);

router.post(
  "/valid",
  auth(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(validators.validteCouponApiSchema),
  expressAsyncHandler(couponController.validteCouponApi)
);

router.put(
  "/enableCoupon/:couponId",
  auth(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(validators.enableCouponSchema),
  expressAsyncHandler(couponController.enableCoupon)
);

router.put(
  "/disableCoupon/:couponId",
  auth(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(validators.disableCouponSchema),
  expressAsyncHandler(couponController.disableCoupon)
);

router.get(
  "/enableCoupons",
  expressAsyncHandler(couponController.getAllEnabledCoupon)
);

router.get(
  "/disableCoupons",
  expressAsyncHandler(couponController.getAllDisabledCoupon)
);

router.get(
  "/:couponId",
  validationMiddleware(validators.getCouponByIdSchema),
  expressAsyncHandler(couponController.getCouponById)
);

router.put(
  "/updateCoupone/:couponId",
  auth(endpointsRoles.ADD_COUPOUN),
  validationMiddleware(validators.updateCouponSchema),
  expressAsyncHandler(couponController.updateCoupon)
);
export default router;
