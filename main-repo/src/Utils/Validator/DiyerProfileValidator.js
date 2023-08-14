import joi from "joi";

export const UpdateDiyerProfileValidator = joi.object({
  // preferences: joi.array().items(joi.string()),
  fullName: joi.string(),
  telephone: joi
    .string()
    .pattern(new RegExp(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/))
    .messages({
      "string.pattern.base": "telephone must be like 132-133-3133",
    }),
  dateOfBirth: joi.date(),
  description: joi.string(),
  userTags: joi.array().items(joi.string()),
  address: joi.string(),
  userTimeZone: joi.string(),
  giveSession: joi.boolean(),
});

export const SearchProfileValidator = joi.object({
  prompt: joi.string(),
})
