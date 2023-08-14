import { Router } from "express";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  CreateSession,
  GetUserActiveSession,
  GetUserInActiveSession,
  EditSession,
  RequestSession,
  GetAllRequests,
  AcceptRequest,
  RejectRequest,
  GetSentRequests,
  IndividualSession,
  RescheduleSession

} from "../Controller/SessionsController.js";
export let SessionsRouter = Router();

SessionsRouter.route("/createSession").post([AuthMiddleware, CreateSession]);
SessionsRouter.route("/getUserActiveSession").get([
  AuthMiddleware,
  GetUserActiveSession,
]);
SessionsRouter.route("/getUserInActiveSession").get([
  AuthMiddleware,
  GetUserInActiveSession,
]);
SessionsRouter.route("/editSession").post([AuthMiddleware, EditSession]);

SessionsRouter.route("/requestSession").post([AuthMiddleware, RequestSession]);
SessionsRouter.route("/getSessionRequests").get([
  AuthMiddleware,
  GetAllRequests,
]);
SessionsRouter.route("/acceptRequests").post([AuthMiddleware, AcceptRequest]);
SessionsRouter.route("/rejectRequests").post([AuthMiddleware, RejectRequest]);
SessionsRouter.route("/getSentRequests").get([
  AuthMiddleware,
  GetSentRequests,
]);
SessionsRouter.route("/requestIndividualSession").post([AuthMiddleware, IndividualSession]);
SessionsRouter.route("/rescheduleSession").post([AuthMiddleware, RescheduleSession]);
