import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as orderController from "./order.controller.js";
import * as validator from "./order.validation-schemas.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./order.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_OREDER),
  validationMiddleware(validator.createOrderSchema),
  expressAsyncHandler(orderController.createOrder)
);

router.post(
  "/cartToOrder",
  auth(endPointsRoles.ADD_OREDER),
  validationMiddleware(validator.convertCartToOrderSchema),
  expressAsyncHandler(orderController.convertFromcartToOrder)
);

router.put(
  "/:orderId",
  auth(endPointsRoles.DELIVER_ORDER),
  validationMiddleware(validator.deliveryOrderSchema),
  expressAsyncHandler(orderController.deliverOrder)
);

router.post(
  "/stripePay/:orderId",
  auth(endPointsRoles.ADD_OREDER),
  validationMiddleware(validator.payWithStripeSchema),
  expressAsyncHandler(orderController.payWithStripe)
);

router.post(
  "/webhook",
  expressAsyncHandler(orderController.stripeWebhookLocal)
);

router.post(
  "/refund/:orderId",
  auth(endPointsRoles.REFUND_ORDER),
  validationMiddleware(validator.refundOrderSchema),
  expressAsyncHandler(orderController.refundOrder)
);

router.put(
  "/cancelOrder/:orderId",
  auth(endPointsRoles.ADD_OREDER),
  validationMiddleware(validator.cancelOrderSchema),
  expressAsyncHandler(orderController.cancelOrder)
);
export default router;
