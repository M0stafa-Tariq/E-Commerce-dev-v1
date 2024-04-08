import Joi from "joi";

import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(50).trim(),
  }),
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const updateSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().optional().min(3).max(50).trim(),
    oldPublicId: Joi.string().optional(),
  }),
  query: Joi.object({
    subCategoryId: generalValidationRule.dbId.required(),
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const deleteSubCategorySchema = {
  params: Joi.object({
    subCategoryId: generalValidationRule.dbId.required(),
  }),
};

export const getSubCategoryByIdSchema = {
  params: Joi.object({
    subCategoryId: generalValidationRule.dbId.required(),
  }),
};

export const getAllBrandsForSpecificSubCategorySchema = {
  params: Joi.object({
    subCategoryId: generalValidationRule.dbId.required(),
  }),
};
