import { Router } from "express";
import { handleMultipartData } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  DeleteAccount,
  GetDiyerProfile,
  UpdateDiyerProfile,
  SearchProfile,
} from "../Controller/DiyerProfileController.js";
export let DiyerProfileRouter = Router();

// Update Profile Details
DiyerProfileRouter.route("/")
  .patch([
    AuthMiddleware,
    handleMultipartData.single("image"),
    UpdateDiyerProfile,
  ])
  .delete([AuthMiddleware, DeleteAccount]);
// Get Diyer Profile Details
DiyerProfileRouter.route("/search").get([AuthMiddleware, SearchProfile]);
DiyerProfileRouter.route("/:id").get([AuthMiddleware, GetDiyerProfile]);
