// import { verifyToken } from '../../Utils/jwt.js'
import Ffmpeg from "fluent-ffmpeg";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";

// UploadReel Middleware

export const UploadReelMiddleware = async (req, res, next) => {
  try {
    if (!req.file) next(CustomError.createError("Media is required", 400));

    console.log(req.file);

    const file = req.file;

    if (!file.mimetype.includes("image") && !file.mimetype.includes("video")) {
      return next(CustomError.createError("Wrong file triggered", 400));
    }
    let mediaThumbnail = null;
    let mediaPath = file.path;

    if (file.mimetype.includes("image")) {
      req.file = {
        userId: req.userId,
        reelMedia: mediaPath,
        reelMediaType: "image",
        reelMediaThumbnail: mediaThumbnail,
      };
    }
    if (file.mimetype.includes("video")) {
      mediaThumbnail = "./public/uploads/" + Date.now() + "-thumbnail.png";
      mediaPath = "./public/uploads/" + Date.now() + "-newVideo.mp4";
      req.file = {
        userId: req.userId,
        reelMedia: mediaPath,
        reelMediaType: "video",
        reelMediaThumbnail: mediaThumbnail,
      };
      Ffmpeg(file.path)
        .size("480x?")
        .output(mediaPath)
        .on("error", (err) => {
          console.log(err);
          return next(
            CustomError.createError(
              "Something went wrong while compressing video thumbnail",
              400
            )
          );
        })
        .on("end", () => {
          console.log("With video=>", mediaPath);
        })
        .run();

      Ffmpeg(file.path)
        .seekInput("00:00:01")
        .frames(1)
        .output(mediaThumbnail)
        .on("error", (err) => {
          return next(
            CustomError.createError(
              "Something went wrong while compressing video thumbnail",
              400
            )
          );
        })
        .on("end", () => {
          console.log(
            "thumbnail created=>",
            mediaThumbnail,
            "With video=>",
            mediaPath
          );
        })
        .run();
    }

    return next();
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError("Something went wrong with ffempg", 500)
    );
  }
};
