import joi from "joi";

export const AddProductValidator = joi.object({
  name: joi.string().required(),
  description: joi.string().required(),
  category: joi.string().required().equal("items", "materials"),
  price: joi.number().required().min(0),
});

export const UpdateProductValidator = joi.object({
  name: joi.string(),
  description: joi.string(),
  category: joi.string().equal("items", "materials"),
  price: joi.number().min(0),
  containImages: joi.array().items(joi.string()).default([]),
});

export const GetProductByCategoryValidator = joi.object({
  category: joi.string().equal("items", "materials").required(),
});

export const GetYourProductsValidator = joi.object({
  userId: joi.string().required(),
  category: joi.string().equal("items", "materials").required(),
});

export const SearchProductValidator = joi.object({
  name: joi.string().required(),
  category: joi.string().equal("items", "materials").required(),
});
