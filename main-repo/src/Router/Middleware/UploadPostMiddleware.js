import Ffmpeg from "fluent-ffmpeg";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
import { uploadMedia } from "../../Utils/Resource/imageResource.js";
// Upload Post Middleware

export const generateThumbnail = async (req) => {
  try {
    const file = req;

    if (!file) next(CustomError.createError("Media is required", 400));
    if (!file.mimetype.includes("video")) {
      return next(CustomError.createError("Wrong file triggered", 400));
    }
    let mediaThumbnail = null;
    let mediaPath = file.path;
    if (file.mimetype.includes("video")) {
      mediaThumbnail = "./public/uploads/" + Date.now() + "-thumbnail.png";
      mediaPath = "./public/uploads/" + Date.now() + "-newVideo.mp4";

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
          return CustomError.createError(
            "Something went wrong while compressing video thumbnail",
            400
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
    return mediaThumbnail;
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError("Something went wrong with ffempg", 500)
    );
  }
};
