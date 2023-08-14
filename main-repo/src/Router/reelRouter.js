import { Router } from "express";
import { handleMultipartDataForBoth } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import { UploadReelMiddleware } from "./Middleware/UploadReelMiddleware.js";
import {
  AddReel,
  DeleteDiyerReel,
  GetDiyerReels,
  GetPublicReels,
} from "../Controller/ReelController.js";
export let ReelRouter = Router();

// Reel
ReelRouter.route("/")
  .get([AuthMiddleware, GetDiyerReels])
  .post([
    AuthMiddleware,
    handleMultipartDataForBoth.single("media"),
    UploadReelMiddleware,
    AddReel,
  ]);
ReelRouter.route("/public").get([AuthMiddleware, GetPublicReels]);
ReelRouter.route("/deleteReels").delete([AuthMiddleware, DeleteDiyerReel]);
