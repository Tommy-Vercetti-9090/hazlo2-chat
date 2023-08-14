import joi from "joi";

export const AddPreferenceValidator = joi.object({
  title: joi.string().required(),
});

export const UpdatePreferenceValidator = joi.object({
  id: joi.string().required(),
  title: joi.string().required(),
});
export const UpdatePreferenceStatusValidator = joi.object({
  id: joi.string().required(),
  status: joi.string().required().valid("active", "blocked"),
});

export const DeletePreferenceValidator = joi.object({
  id: joi.string().required(),
});
