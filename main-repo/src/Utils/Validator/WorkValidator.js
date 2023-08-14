import joi from "joi";

export const DeleteWorkValidator = joi.object({
  deleteWorkIdArr: joi.array().items(joi.string()).required(),
  // .empty(joi.array().length(0)),
});
