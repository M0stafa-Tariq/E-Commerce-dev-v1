import joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";

export const addReviewSchema = {
  body: joi.object({
    reviewRate: joi.number().min(1).max(5).required(),
    reviewComment: joi.string().min(5).max(255),
  }),
  params: joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const getAllReviewsForSpecificProductSchema = {
  params: joi.object({
    productId: generalValidationRule.dbId.required(),
  }),
};

export const deleteReview = {
  params: joi.object({
    reviewId: generalValidationRule.dbId.required(),
  }),
};
