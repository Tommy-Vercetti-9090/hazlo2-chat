import { Router } from "express";
import {
  handleMultipartData,
  handleMultipartDataForBoth,
} from "../Utils/MultipartData.js";
import {
  CreatePost,
  GetAllPosts,
  ReportPost,
  HidePost,
  UpdatePost,
  LikePost,
  CommentPost,
  DeleteComment,
  GetAllComments,
  SharePost,
  GetLikesOnPost,
  DeletePost,
  GetYourPost,
  SearchPost
} from "../Controller/PostsController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
// import { UploadPostMiddleware } from "./Middleware/UploadPostMiddleware.js";
export let PostRouter = Router();

PostRouter.route("/createPost").post([
  AuthMiddleware,
  handleMultipartDataForBoth.array("media", 6),
  CreatePost,
]);
PostRouter.route("/getAllPosts").get([AuthMiddleware, GetAllPosts]);
PostRouter.route("/reportPost").post([AuthMiddleware, ReportPost]);
PostRouter.route("/hidePost").post([AuthMiddleware, HidePost]);
PostRouter.route("/updatePost").post([AuthMiddleware, UpdatePost]);
PostRouter.route("/likePost").post([AuthMiddleware, LikePost]);
PostRouter.route("/commentPost").post([AuthMiddleware, CommentPost]);
PostRouter.route("/deleteComment").post([AuthMiddleware, DeleteComment]);
PostRouter.route("/getAllComments").get([AuthMiddleware, GetAllComments]);
PostRouter.route("/sharePost").post([AuthMiddleware, SharePost]);
PostRouter.route("/getLikes").get([AuthMiddleware, GetLikesOnPost]);
PostRouter.route("/deletePost").delete([AuthMiddleware, DeletePost]);
PostRouter.route("/getYourPosts").get([AuthMiddleware, GetYourPost]);
PostRouter.route("/searchPost").get([AuthMiddleware, SearchPost]);