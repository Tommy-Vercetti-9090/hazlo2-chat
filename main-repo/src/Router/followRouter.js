import { Router } from "express";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  FollowUser,
  GetFollowers,
  GetFollowing,
  RemoveFollowers,
  UnFollowUser,
} from "../Controller/FollowController.js";
export let FollowRouter = Router();

// Follow
FollowRouter.route("/follow").post([AuthMiddleware, FollowUser]);
// UnFollow
FollowRouter.route("/unfollow").post([AuthMiddleware, UnFollowUser]);
// Remove Followers
FollowRouter.route("/followers/remove").patch([
  AuthMiddleware,
  RemoveFollowers,
]);
// Get Followers
FollowRouter.route("/followers/:userId").get([AuthMiddleware, GetFollowers]);
// Get Following
FollowRouter.route("/following/:userId").get([AuthMiddleware, GetFollowing]);
