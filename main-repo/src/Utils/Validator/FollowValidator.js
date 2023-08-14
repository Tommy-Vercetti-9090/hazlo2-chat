import joi from "joi";

export const FollowUserValidator = joi.object({
  to: joi.array().items(joi.string().required()).required(),
});

export const UnFollowUserValidator = joi.object({
  to: joi.array().items(joi.string().required()).required(),
});

export const RemoveFollowersValidator = joi.object({
  to: joi.array().items(joi.string().required()).required(),
});
export const FollowAndUnFollowUserValidator = joi.object({
  follow: joi.boolean().required(),
  to: joi.array().items(joi.string().required()).required(),
});

export const GetFollowersValidator = joi.object({
  userId: joi.string().required(),
});
export const GetFollowingValidator = joi.object({
  userId: joi.string().required(),
});
