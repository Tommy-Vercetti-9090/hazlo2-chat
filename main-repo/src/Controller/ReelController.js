import { Types } from "mongoose";
import ReelModel from "../DB/Model/reelModel.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";

// Add Reel
export const AddReel = async (req, res, next) => {
  try {
    if (!req.file)
      next(
        CustomError.createError(
          "Something went wrong while uploading reel",
          500
        )
      );

    const reelMedia = await uploadMedia(
      req.file.reelMedia,
      req.file.reelMediaType,
      req.userId,
      "Diyer"
    );

    if (!reelMedia)
      next(
        CustomError.createError(
          "Some Error occurred while uploading media",
          500
        )
      );

    const createReel = await ReelModel.create({
      ...req.file,
      reelMedia,
      expireReel: Date.now() + 24 * 60 * 60 * 1000,
    });

    return next(
      CustomSuccess.createSuccess(createReel, "Reel created successfuly", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 200));
  }
};

// Get Diyer Reels
export const GetDiyerReels = async (req, res, next) => {
  try {
    const { id } = req.query;
    let reel = await ReelModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(id.toString()),
          isExpired: false,
          isDeleted: false,
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    reel = await ReelModel.populate(reel, [
      {
        path: "reelMedia",
      },
    ]);
    return next(
      CustomSuccess.createSuccess(reel, "Diyer reel fetched successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

// Delete Reel
export const DeleteDiyerReel = async (req, res, next) => {
  try {
    const reelIdArr = req.body.reelId;
    if (reelIdArr.length == 0)
      return next(CustomError.createError("reelId is required", 400));

    const findReel = await ReelModel.find({
      _id: {
        $in: reelIdArr,
      },
      userId: req.userId,
      isDeleted: false,
    });
    if (findReel.length !== reelIdArr.length)
      return next(
        CustomError.createError("Not all reel found with your id", 200)
      );

    const deleteReel = await ReelModel.updateMany(
      { _id: { $in: reelIdArr }, userId: req.userId, isDeleted: false },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    ).lean();
    if (!deleteReel) {
      return next(
        CustomError.createError("Not all reel with your id got delete", 200)
      );
    }
    return next(
      CustomSuccess.createSuccess(
        // {deleteReel},
        {},
        "Reels deleted successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

// Get Public Reels
export const GetPublicReels = async (req, res, next) => {
  try {
    //Hunain
    let reels = await ReelModel.aggregate([
      {
        $match: {
          isExpired: false,
          isDeleted: false,
        },
      },
    ]);

    reels = await ReelModel.populate(reels, [
      {
        path: "userId",
        model: "User",
        select: "fullName image email",
        populate: "image",
      },
      {
        path: "reelMedia",
        model: "Media",
      },
    ]);

    //Tanveer
    // let reels = await ReelModel.aggregate([
    //   {
    //     $match: {
    //       isExpired: false,
    //       isDeleted: false,
    //     },
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "media",
    //   //     localField: "reelMedia",
    //   //     foreignField: "_id",
    //   //     as: "reelMedia",
    //   //   },
    //   // },
    //   // {
    //   //   $unwind: "$reelMedia",
    //   //   // preserveNullAndEmptyArrays: true,
    //   // },
    //   {
    //     $group: {
    //       _id: "$userId",
    //       reels: { $push: "$$ROOT" },
    //     },
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: "users",
    //   //     localField: "_id",
    //   //     foreignField: "_id",
    //   //     as: "userObj",
    //   //   },
    //   // },
    //   // {
    //   //   $unwind: "$userObj",
    //   //   // preserveNullAndEmptyArrays: true,
    //   // },
    //   {
    //     $sort: {
    //       _id: -1,
    //     },
    //   },
    // ]);

    // reels = await ReelModel.populate(reels, [
    //   {
    //     path: "_id",
    //     model: "User",
    //     select: "fullName image email",
    //     populate: "image",
    //   },
    //   {
    //     path: "reels.reelMedia",
    //     model: "Media",
    //   },
    // ]);

    console.log({ reels });
    return next(
      CustomSuccess.createSuccess(
        reels,
        "Public reels fetched successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
