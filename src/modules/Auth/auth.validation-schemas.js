import Joi from "joi";
import { systemRoles } from "../../utils/system-enums.js";

export const signUpSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(10).required().trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(11).required(),
    phoneNumbers: Joi.array()
      .required()
      .items(Joi.string().length(11).required().trim()),
    addresses: Joi.array().required().items(Joi.string().required().trim()),
    age: Joi.number().required().max(100).min(18),
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

export const verifyEmailSchema = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(11).required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string().min(6).max(11).required(),
  }),
  params: Joi.object({
    token: Joi.string().required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().min(6).max(11).required(),
    newPassword: Joi.string().min(6).max(11).required(),
  }),
};
