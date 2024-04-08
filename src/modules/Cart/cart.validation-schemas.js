import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addProductToCartSchema = {
  body: Joi.object({
    productId: generalValidationRule.dbId.required(),
    quantity: Joi.number().integer().min(1).required(),
  }),
};

export const removeProductFromCartSchema = {
  params: Joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

