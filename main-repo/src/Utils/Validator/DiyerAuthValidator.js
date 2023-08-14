import joi from "joi";
import { deviceRequired, locationRequired } from "./commonValidation.js";

export const RegisterDiyerValidator = joi.object({
  email: joi.string().email().required(),
  telephone: joi
    .string()
    .pattern(new RegExp(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/))
    .required(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /(?=[A-Za-z0-9@#$%^&+!=?*_-]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=?*_-])(?=.{8,}).*$/
      )
      // new RegExp(
      //   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?_.&])[A-Za-z\d@$!%*#_.?&]{8,30}$/
      // )
    )
    .messages({
      "string.pattern.base":
        "password length should be 8 .Must include 1 uppercase 1 lowercase 1 number and 1 special character(@#$%^&+!=?*_-)",
    })
    // .min(6).max(30)
    .required(),
  ...locationRequired,
  //test the given deviceToken
  ...deviceRequired,
  // confirmPassword: joi.string().required(),
});

export const DiyerAccountVerificationValidator = joi.object({
  userId: joi.string().required(),
  otpKey: joi.string().min(6).max(6).required(),
});

export const LoginDiyerValidator = joi.object({
  username: joi.string().required(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /(?=[A-Za-z0-9@#$%^&+!=?*_-]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=?*_-])(?=.{8,}).*$/
      )
      // new RegExp(
      //   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?_.&])[A-Za-z\d@$!%*#_.?&]{8,30}$/
      // )
    )
    .messages({
      "string.pattern.base":
        "password length should be 8 .Must include 1 uppercase 1 lowercase 1 number and 1 special character(@#$%^&+!=?*_-)",
    })
    // .min(6).max(30)
    .required(),
  ...locationRequired,
  deviceType: joi.string().required().valid("android", "web", "ios", "postman"),
  deviceToken: joi.string().required().allow(""),
  
  //test the given deviceToken
});

export const ResendOtpForAccountVerificationValidator = joi.object({
  userId: joi.string().required(),
});

export const AddProfileDetailsValidator = joi.object({
  preferences: joi.array().items(joi.string().required()).required(),
  fullName: joi.string().required(),
  dateOfBirth: joi.date().required(),
  description: joi.string().required(),
  userTags: joi.array().items(joi.string()),
  address: joi.string().allow(""),
  giveSession: joi.boolean().required(),
  userTimeZone: joi.string().required(),
  image: joi.string().allow(""),
});

export const ForgetPasswordDiyerValidator = joi.object({
  email: joi.string().email().required(),
});

export const VerifyOtpDiyerValidator = joi.object({
  userId: joi.string().required(),
  otpKey: joi.string().required(),
});

export const ResetPasswordDiyerValidator = joi.object({
  otpId: joi.string().required(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        /(?=[A-Za-z0-9@#$%^&+!=?*_-]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=?*_-])(?=.{8,}).*$/
      )
      // new RegExp(
      //   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?_.&])[A-Za-z\d@$!%*#_.?&]{8,30}$/
      // )
    )
    .messages({
      "string.pattern.base":
        "password length should be 8 .Must include 1 uppercase 1 lowercase 1 number and 1 special character(@#$%^&+!=?*_-)",
    })
    // .min(6).max(30)
    .required(),
});

export const SocialRegisterDiyerValidator = joi.object({
  socialType: joi.string().required().equal("apple", "facebook", "google"),
  accessToken: joi.string().required(),
  ...locationRequired,
  ...deviceRequired,
});
