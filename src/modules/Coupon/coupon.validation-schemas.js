import joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addCouponSchema = {
  body: joi.object({
    couponCode: joi.string().required().min(3).max(15).alphanum(),
    couponAmount: joi.number().required().min(1),
    isFixed: joi.boolean(),
    isPercentage: joi.boolean(),
    fromDate: joi
      .date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: joi.date().greater(joi.ref("fromDate")).required(),
    Users: joi.array().items(
      joi.object({
        userId: generalValidationRule.dbId.required(),
        maxUsage: joi.number().required().min(1),
      })
    ),
  }),
};

export const validteCouponApiSchema = {
  body: joi.object({
    couponCode: joi.string().required().min(3).max(15).alphanum(),
  }),
};

export const disableCouponSchema = {
  params: joi.object({
    couponId: generalValidationRule.dbId.required(),
  }),
};

export const enableCouponSchema = {
  params: joi.object({
    couponId: generalValidationRule.dbId.required(),
  }),
};

export const updateCouponSchema = {
  body: joi.object({
    couponCode: joi.string().min(3).max(15).alphanum(),
    couponAmount: joi.number().min(1),
    isFixed: joi.boolean(),
    isPercentage: joi.boolean(),
    fromDate: joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
    toDate: joi.date().greater(joi.ref("fromDate")),
    users: joi.array().items(
      joi.object({
        userId: generalValidationRule.dbId,
        maxUsage: joi.number().min(1),
      })
    ),
  }),
};


export const getCouponByIdSchema = {
  params: joi.object({
    couponId: generalValidationRule.dbId.required(),
  }),
};