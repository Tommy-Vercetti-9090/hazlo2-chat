import { Router } from "express";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  BlockUser,
  ListOfBlockUser,
  UnBlockUser,
} from "../Controller/BlockController.js";
export let BlockRouter = Router();

// Block User
BlockRouter.route("/")
  .get([AuthMiddleware, ListOfBlockUser])
  .post([AuthMiddleware, BlockUser]);

// Un Block User
BlockRouter.route("/remove").post([AuthMiddleware, UnBlockUser]);
