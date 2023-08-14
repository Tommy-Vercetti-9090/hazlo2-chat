import joi from "joi";

// export const AddStoryValidator = joi.object({
// socialType: joi.string().required().equal("apple", "facebook", "google"),
// userId: joi.string().required(),
// mediaType: joi.string().required().valid("image", "video"),
// auth: joi.string().required(),
// lat: joi.number().min(-90).max(90).required(),
// long: joi.number().min(-180).max(180).required(),
//test the given deviceToken
// deviceToken: joi.string().required(),
// deviceType: joi.string().required().equal("android", "ios", "postman"),
// });

export const GetDiyerValidator = joi.object({
  // userId: joi.string().required(),
});

// export const GetStoriesByFollowingValidator = joi.object({
//   userId: joi.string().required(),
// });
// export const DeleteStoryValidator = joi.object({
//   storyId: joi.string().required(),
// });
