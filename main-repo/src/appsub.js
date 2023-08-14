// Librarys
import cors from "cors";
import express from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import Ffmpeg from "fluent-ffmpeg";
import path from "path";
import { fileURLToPath } from "url";
import ffempgPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
// Response Handler
import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";
import { DiyerAuthRouter } from "./Router/diyerAuthRouter.js";
import { PreferenceRouter } from "./Router/preferenceRouter.js";
import { WorkRouter } from "./Router/workRouter.js";
import { ProductRouter } from "./Router/productRouter.js";
import { DiyerProfileRouter } from "./Router/diyerProfileRouter.js";
import { FollowRouter } from "./Router/followRouter.js";
import { StoryRouter } from "./Router/storyRouter.js";
import { ReelRouter } from "./Router/reelRouter.js";
import { BlockRouter } from "./Router/blockRouter.js";
import { PostRouter } from "./Router/postRouter.js";
import { PaymentRouter } from "./Router/paymentRouter.js";
import { SessionsRouter } from "./Router/sessionsRouter.js";
// import {ChatRouter} from "./Router/chatRouter.js";

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export let app = express();

const API_PreFix = "/api/v1";
const Auth_PreFix = "/auth";
const Preference_PreFix = "/preference";
const Work_PreFix = "/work";
const Product_PreFix = "/product";
const Diyer_PreFix = "/diyer";
const Profile_PreFix = "/profile";
const Story_PreFix = "/story";
const Reel_PreFix = "/reel";
const Block_PreFix = "/block";
const Post_Prefix = "/post";
const Chat_Prefix = "/chat";
const Session_Prefix = "/session";
const Payment_Prefix = "/payment";

// const Follow_PreFix, = "/follow";

app.use("/public/uploads", express.static("./public/uploads"));

var corsOptions = {
  origin: "*",
};

app.use(express.json());
app.use(cors(corsOptions));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});

try {
  Ffmpeg.setFfmpegPath(ffempgPath.path);
  Ffmpeg.setFfprobePath(ffprobePath.path);
} catch (error) {
  console.log("Some error occured on ffempg");
}
app.get("/", (req, res) => {
  return res.json({ message: "Welcome to Hazlo2" });
});

// Root Routes
app.use(API_PreFix + Auth_PreFix, DiyerAuthRouter);
app.use(API_PreFix + Preference_PreFix, PreferenceRouter);
app.use(API_PreFix + Work_PreFix, WorkRouter);
app.use(API_PreFix + Product_PreFix, ProductRouter);
app.use(API_PreFix + Diyer_PreFix + Profile_PreFix, DiyerProfileRouter);
app.use(API_PreFix + Diyer_PreFix, FollowRouter);
app.use(API_PreFix + Diyer_PreFix + Story_PreFix, StoryRouter);
app.use(API_PreFix + Diyer_PreFix + Reel_PreFix, ReelRouter);
app.use(API_PreFix + Diyer_PreFix + Block_PreFix, BlockRouter);
app.use(API_PreFix + Diyer_PreFix + Post_Prefix, PostRouter);
app.use(API_PreFix + Diyer_PreFix + Session_Prefix, SessionsRouter);
app.use(API_PreFix + Diyer_PreFix + Payment_Prefix, PaymentRouter);

// app.use(API_PreFix + Diyer_PreFix + Chat_Prefix , ChatRouter);

app.use(ResHandler);
