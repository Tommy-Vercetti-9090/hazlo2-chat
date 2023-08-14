import { Router } from "express";

import {
  CreateCustomer,
  AddCard,
  MakePayment,
  testing,
} from "../Controller/PaymentController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let PaymentRouter = Router();

PaymentRouter.route("/createCustomer").post([CreateCustomer]);
PaymentRouter.route("/addCard").post([AddCard]);
PaymentRouter.route("/createPayment").post([MakePayment]);
PaymentRouter.route("/test").get([testing]);
