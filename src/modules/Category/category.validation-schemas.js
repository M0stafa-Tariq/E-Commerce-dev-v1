import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addCategorySchema = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(20).alphanum(),
  }),
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().optional().min(3).max(20).alphanum(),
    oldPublicId: Joi.string().optional(),
  }),
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const deleteCategorySchema = {
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const getCategoryByIdSchema = {
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const getAllSubCategoryForSpecificCategorySchema = {
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const getAllBrandsForSpecificCategorySchema = {
  params: Joi.object({
    categoryId: generalValidationRule.dbId.required(),
  }),
};
