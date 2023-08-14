import MediaModel from "../../DB/Model/media.js";
import CustomSuccess from "../../Utils/ResponseHandler/CustomSuccess.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
import { unlinkSync } from "fs";
// import { checkUserType } from "./userTypeResource.js";

export const uploadMedia = async (file, mediaType, userId, userType) => {
  if (file) {
    const mediaTypes = ["image", "video", "audio"];
    if (!mediaTypes.includes(mediaType)) {
      // unlinkSync(file.path);
      throw new Error("mediaType is not correct");
    }
    const path = file.path ? file.path : file;
    try {
      const createdMedia = await new MediaModel({
        mediaUrl: path,
        mediaType,
        userId,
        userType,
      }).save();
      return createdMedia._id;
    } catch (error) {
      // unlinkSync(file?.path);
      throw new Error(error.message);
    }
    // try {
    //   const { userType, userModel } = await checkUserType(profileType, profile);
    // } catch (error) {
    //   throw new Error(error.message);
    // }
    // return `${req.protocol}://${req.get("host")}/api/v1/ecommerce/image/${file.filename}`;
  }
  // unlinkSync(file?.path);
  return false;
};
