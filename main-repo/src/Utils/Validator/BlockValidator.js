import joi from "joi";

export const BlockUserValidator = joi.object({
  users: joi.array().items(joi.string().required()).required(),
});

export const UnBlockUserValidator = joi.object({
  users: joi.array().items(joi.string().required()).required(),
});
