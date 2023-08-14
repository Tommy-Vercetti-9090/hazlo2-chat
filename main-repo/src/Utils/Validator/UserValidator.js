import joi from "joi";
import { deviceRequired, locationRequired } from "./commonValidation.js";

export const RegisterVendorValidator = joi.object({
  ownerName: joi.string().required(),
  // shopName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  ...locationRequired, //test the given deviceToken
  ...deviceRequired,
  // confirmPassword: joi.string().required(),
});

//social register validator
export const SocialRegisterValidator = joi.object({
  socialType: joi.string().required().equal("apple", "facebook", "google"),
  accessToken: joi.string().required(),
  ...locationRequired, //test the given deviceToken
  ...deviceRequired,
});

//login validator

export const LoginValidator = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  ...locationRequired, //test the given deviceToken
  ...deviceRequired,
});

//social login validator
export const SocailLoginValidator = joi.object({
  accessToken: joi.string().required(),
  socialType: joi.string().required().equal("apple", "facebook", "google"),
  ...deviceRequired,
  ...locationRequired,
});

//forget password validator

// export const ForgotPasswordValidator = joi.object({
//   email: joi.string().required(),
// });

// otp validator
export const ResetPasswordOTPValidator = joi.object({
  user_id: joi.string().required(),
  otp: joi.string().required(),
});

//reset password validator
export const ResetPasswordValidator = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

//profile validator
export const UpdateProfileValidator = joi.object({
  name: joi.string().required(),
  gender: joi.string().required(),
  dateOFBirth: joi.date().required(),
  mobile: joi.number().required(),
  address: joi.string().required(),
});

//logout validator
export const LogoutValidator = joi.object({});
