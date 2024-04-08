import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addBrandSchema = {
  body: Joi.object({
    name: Joi.string().required().trim(),
  }),
  query: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
    subCategoryId: generalValidationRule.dbId.required(),
  }),
};

export const updateBrandSchema = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    oldPublicId: Joi.string().optional(),
  }),
  params: Joi.object({
    brandId: generalValidationRule.dbId.required(),
  }),
};

export const deleteBrandSchema = {
  params: Joi.object({
    brandId: generalValidationRule.dbId.required(),
  }),
};
