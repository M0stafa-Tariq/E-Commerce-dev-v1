import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addProductSchema = {
  body: Joi.object({
    title: Joi.string().required().trim().min(3).max(255),
    desc: Joi.string(),
    stock: Joi.number().min(0).required().default(1),
    basePrice: Joi.number().required(),
    discount: Joi.number().min(0).max(100).default(0),
    specs: Joi.object()
      .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
      .required(),
  }),
  query: Joi.object({
    brandId: generalValidationRule.dbId.required(),
    subCategoryId: generalValidationRule.dbId.required(),
    categoryId: generalValidationRule.dbId.required(),
  }),
};

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(255).optional(),
    desc: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
    basePrice: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).max(100).optional(),
    specs: Joi.object()
      .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
      .optional(),
    oldPublicId: Joi.string().optional(),
  }),
  params: Joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const deleteProductSchema = {
  params: Joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const getProductByIdSchema = {
  params: Joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const getAllProductsPaginatedSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).required(),
    size: Joi.number().integer().min(1).required(),
  }),
};

export const getSpecProductSchema = {
  params: Joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const searchProductSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    size: Joi.number().integer().min(1).optional(),
    sort: Joi.string().optional(),
  }).unknown(true),
};

export const allProductForTwoBrandsSchema = {
  query: Joi.object({
    brandId1: generalValidationRule.dbId.required(),
    brandId2: generalValidationRule.dbId.required(),
  }),
};
