import { Router } from "express";
import { handleMultipartDataForBoth } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  AddWork,
  DeleteWorkImagesOrVideos,
  GetAllImages,
  GetAllVideos,
  GetAllWork,
} from "../Controller/WorkController.js";
import { UploadWorkArrMiddleware } from "./Middleware/UploadWorkArrMiddleware.js";
export let WorkRouter = Router();

// // POST  Register Diyer
// WorkRouter.route("/register").post([RegisterDiyer]);
// // Account Verification
// WorkRouter.route("/accountVerification").post([DiyerAccountVerification]);
// // Login
// WorkRouter.route("/login").post([LoginDiyer]);
// // Resemd OTP for Account Verification
// WorkRouter.route("/resendOtpForAccountVerification").post([
//   ResendOtpForAccountVerification,
// ]);

// Delete Work Images OR Videos
WorkRouter.route("/").delete([AuthMiddleware, DeleteWorkImagesOrVideos]);
// Add Profile details
WorkRouter.route("/add").post([
  AuthMiddleware,
  handleMultipartDataForBoth.array("workArr", 12),
  UploadWorkArrMiddleware,
  AddWork,
]);
WorkRouter.route("/images").get([AuthMiddleware, GetAllImages]);
WorkRouter.route("/videos").get([AuthMiddleware, GetAllVideos]);
WorkRouter.route("/all").get([AuthMiddleware, GetAllWork]);
