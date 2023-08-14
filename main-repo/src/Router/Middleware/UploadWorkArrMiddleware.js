// import { verifyToken } from '../../Utils/jwt.js'
import Ffmpeg from "fluent-ffmpeg";
import ffmpegConfig from "../../Config/ffmpegConfig.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
import { createReadStream, unlinkSync } from "fs";
import path from "path";

// UploadWorkArr Middleware
export const UploadWorkArrMiddleware = async (req, res, next) => {
  try {
    console.log(req.files);
    if (!req.files) {
      return next(CustomError.createError("No file provided", 400));
    }

    const filesLength = req.files.length;
    if (filesLength === 0) {
      return next(CustomError.createError("No file provided", 400));
    }

    const files = req.files;
    let result = [];

    for (let i = 0; i < filesLength; i++) {
      let mediaType;
      let mediaPath;
      let mediaThumbnail;

      if (
        !files[i].mimetype.includes("image") &&
        !files[i].mimetype.includes("video")
      ) {
        return next(CustomError.createError("Wrong file triggered", 400));
      }

      if (files[i].mimetype.includes("image")) {
        mediaType = "image";
        mediaThumbnail = null;
        // mediaPath = "./public/uploads/" + Date.now() + "-image.png";
        mediaPath = files[i].path;
      }
      if (files[i].mimetype.includes("video")) {
        mediaType = "video";
        mediaPath = files[i].path;
        // Ffmpeg.setFfmpegPath(ffmpegConfig.FFMPEG_PATH);
        // Ffmpeg.setFfprobePath(ffmpegConfig.FFPROBE_PATH);
        // Ffmpeg.setFlvtoolPath(ffmpegConfig.FLVTOOL_PATH);
        // const fileName = files[i].originalname.split(" ").join("-");
        // const extension = path.extname(fileName);
        mediaThumbnail = "./public/uploads/" + Date.now() + "-thumbnail.png";
        // mediaPath = "./public/uploads/" + Date.now() + "-video" + extension;

        // Ffmpeg(files[i].path)
        //   .size(`${640}x${480}`)
        //   // .videoBitrate("500k")
        //   // .output(mediaPath)
        //   .videoCodec("libx264")
        //   .audioCodec("aac")
        //   .autopad()
        //   .output(mediaPath)
        //   // .videoBitrate(`1k`)
        //   .on("error", () => {
        //     return next(
        //       CustomError.createError(
        //         "Something went wrong while compressing video",
        //         400
        //       )
        //     );
        //   })
        //   .on("end", async function () {
        //     console.log("vedio compressed");
        // unlinkSync(files[i].path);
        // Ffmpeg(mediaPath)
        // .seekInput("00:00:05")
        // .frames(1)
        //   .output(mediaThumbnail)
        //   .on("error", (err) => {
        //     return next(
        //       CustomError.createError(
        //         "Something went wrong while compressing video thumbnail",
        //         400
        //       )
        //     );
        //   })
        //   .on("end", () => {
        //     console.log("thumbnail created");
        //   })
        //   .run();
        // })
        // .run();
        Ffmpeg(files[i].path)
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

      result.push({
        userId: req.userId,
        mediaPath,
        mediaType,
        mediaThumbnail,
      });
    }
    req.result = result;
    return next();
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError("Something went wrong with ffempg", 500)
    );
  }
};
