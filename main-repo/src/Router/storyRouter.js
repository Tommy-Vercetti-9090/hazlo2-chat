import { Router } from "express";
import { handleMultipartDataForBoth } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  AddStory,
  DeleteDiyerStory,
  GetDiyerStory,
  GetStoriesByFollowing,
} from "../Controller/StoryController.js";
import { UploadStoryMiddleware } from "./Middleware/UploadStoryMiddleware.js";
export let StoryRouter = Router();

// Story
StoryRouter.route("/")
  .get([AuthMiddleware, GetDiyerStory])
  .post([
    AuthMiddleware,
    handleMultipartDataForBoth.single("media"),
    UploadStoryMiddleware,
    AddStory,
  ]);
StoryRouter.route("/following").get([AuthMiddleware, GetStoriesByFollowing]);
StoryRouter.route("/deleteStories").delete([AuthMiddleware, DeleteDiyerStory]);
