import { Router } from "express";
import {
  AddProfileDetails,
  DiyerAccountVerification,
  ForgetPasswordDiyer,
  LoginDiyer,
  RegisterDiyer,
  ResendOtpForAccountVerification,
  ResetPasswordDiyer,
  SocialRegisterDiyer,
  VerifyOtpDiyer,
} from "../Controller/DiyerAuthController.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
export let DiyerAuthRouter = Router();

// POST  Register Diyer
DiyerAuthRouter.route("/register").post([RegisterDiyer]);
// Account Verification
DiyerAuthRouter.route("/accountVerification").post([DiyerAccountVerification]);
// Login
DiyerAuthRouter.route("/login").post([LoginDiyer]);
// Resemd OTP for Account Verification
DiyerAuthRouter.route("/resendOtpForAccountVerification").post([
  ResendOtpForAccountVerification,
]);
// Add Profile details
DiyerAuthRouter.route("/addProfileDetails").post([
  AuthMiddleware,
  handleMultipartData.single("image"),
  AddProfileDetails,
]);
// Forget Password
DiyerAuthRouter.route("/forgetPassword").post([ForgetPasswordDiyer]);
DiyerAuthRouter.route("/verifyOtp").post([VerifyOtpDiyer]);
DiyerAuthRouter.route("/resetPassword").post([ResetPasswordDiyer]);

// Socail Signup/Login

DiyerAuthRouter.route("/social").post([SocialRegisterDiyer]);
