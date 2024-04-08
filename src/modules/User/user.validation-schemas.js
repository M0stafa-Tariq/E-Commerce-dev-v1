import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";
import { systemRoles } from "../../utils/system-enums.js";

export const updateUserSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(10).trim(),
    email: Joi.string().email(),
    phoneNumbers: Joi.array().items(Joi.string().length(11).trim()),
    addresses: Joi.array().items(Joi.string().trim()),
    age: Joi.number().max(80).min(18),
    role: Joi.string()
      .valid(
        systemRoles.ADMIN,
        systemRoles.DELIEVER_ROLE,
        systemRoles.SUPER_ADMIN,
        systemRoles.USER
      )
      .default(systemRoles.USER),
  }),
};

export const deleteUserSchema = {
  query: Joi.object({
    userId: generalValidationRule.dbId.required(),
  }),
};

export const softDeleteUserSchema = {
    query: Joi.object({
        userId: generalValidationRule.dbId,
    })
}