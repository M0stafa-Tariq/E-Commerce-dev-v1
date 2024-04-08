import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";
import { paymentMethod } from "../../utils/system-enums.js";

export const createOrderSchema = {
  body: Joi.object({
    productId: generalValidationRule.dbId.required(),
    quantity: Joi.number().integer().min(1).required(),
    couponCode: Joi.string().optional().min(3).max(10).alphanum(),
    paymentMethod: Joi.string()
      .valid(paymentMethod.CASH, paymentMethod.PAYMOB, paymentMethod.STRIPE)
      .required(),
    phoneNumbers: Joi.array()
      .items(Joi.string().length(11).required())
      .required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }),
};

export const convertCartToOrderSchema = {
  body: Joi.object({
    couponCode: Joi.string().optional().min(3).max(10).alphanum(),
    paymentMethod: Joi.string()
      .valid(paymentMethod.CASH, paymentMethod.PAYMOB, paymentMethod.STRIPE)
      .required(),
    phoneNumbers: Joi.array()
      .items(Joi.string().length(11).required())
      .required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }),
};

export const deliveryOrderSchema = {
  params: Joi.object({
    orderId: generalValidationRule.dbId.required(),
  }),
};

export const payWithStripeSchema = {
    params: Joi.object({
      orderId: generalValidationRule.dbId.required(),
    }),
  };

  export const refundOrderSchema = {
    params: Joi.object({
      orderId: generalValidationRule.dbId.required(),
    }),
  };

  export const cancelOrderSchema = {
    params: Joi.object({
      orderId: generalValidationRule.dbId.required(),
    }),
  };