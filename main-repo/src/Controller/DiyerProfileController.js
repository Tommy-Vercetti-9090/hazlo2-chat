import mongoose, { Types } from "mongoose";
import UserModel from "../DB/Model/userModel.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import {
  UpdateDiyerProfileValidator,
  SearchProfileValidator,
} from "../Utils/Validator/DiyerProfileValidator.js";
import ProductModel from "../DB/Model/productModel.js";
import FollowModel from "../DB/Model/followModel.js";
import ReelModel from "../DB/Model/reelModel.js";
import StoryModel from "../DB/Model/storyModel.js";
import WorkModel from "../DB/Model/workModel.js";

export const GetDiyerProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId || !userId?.length) {
      return next(CustomError.createError("User ID is required", 400));
    }

    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    let user = await UserModel.aggregate([
      // {
      //   $match: {
      //     $and: [
      //       { _id: Types.ObjectId(userId.toString()) },
      //       {
      //         _id: {
      //           $nin: req.blockUsers,
      //         },
      //       },
      //     ],
      //     blockUsers: {
      //       $nin: [req.userId],
      //     },
      //   },
      // },
      {
        $match: {
          _id: Types.ObjectId(userId.toString()),
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    user = await UserModel.populate(user, [
      { path: "image" },
      {
        path: "preferences",
      },
    ]);

    user = user[0];
    if (!user) {
      return next(CustomError.createError("No user Found", 404));
    }
    if (user.isDeleted) {
      return next(CustomError.createError("User Account is blocked", 401));
    }

    return next(
      CustomSuccess.createSuccess(user, "User fetched Successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const UpdateDiyerProfile = async (req, res, next) => {
  try {
    const image = req?.file;
    console.log("image file", image);
    try {
      await UpdateDiyerProfileValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    // Generate Image URL
    if (image) {
      //  file, mediaType, userType, profile;
      const profileImageUrl = await uploadMedia(
        image,
        "image",
        req.userId,
        "Diyer"
      );
      if (!profileImageUrl) {
        return next(
          CustomError.createError(
            "Something went wrong while uploading image",
            400
          )
        );
      }
      req.body.image = profileImageUrl;
    }

    const user = await UserModel.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        ...req.body,
        // $addToSet: {
        //   userTags: req?.body?.userTags ? req?.body?.userTags : [],
        // },
      },
      {
        new: true,
      }
    )
      .select("-password")
      .populate([
        { path: "image" },
        {
          path: "preferences",
        },
      ]);

    if (!user) {
      return next(CustomError.createError("No user Found", 404));
    }
    if (user.isDeleted) {
      return next(CustomError.createError("User Account is blocked", 401));
    }

    return next(
      CustomSuccess.createSuccess(user, "User Updated Successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const DeleteAccount = async (req, res, next) => {
  // Create Session
  let session = await mongoose.startSession();

  try {
    const user = await UserModel.findOne({
      _id: req.userId,
    });

    if (user.isDeleted) {
      return next(CustomError.createError("No Account Found", 400));
    }

    session.startTransaction();

    // Update User Object
    await user
      .updateOne({
        isDeleted: true,
        email: user?.email + "AccountDeleted",
        telephone: user?.telephone + "AccountDeleted",
        socialIdentifier: user?.socialIdentifier + "AccountDeleted",
        socialAccessToken: user?.socialAccessToken + "AccountDeleted",
      })
      .session(session);
    console.log({ user });

    // Update Products Object
    const deleteProducts = await ProductModel.updateMany(
      {
        userId: req.userId,
      },
      {
        isDeleted: true,
      }
    ).session(session);
    console.log({ deleteProducts });

    // Update Stories Object
    const deleteStories = await StoryModel.updateMany(
      {
        userId: req.userId,
      },
      {
        isDeleted: true,
      }
    ).session(session);
    console.log({ deleteStories });

    // Update Reels Object
    const deleteReels = await ReelModel.updateMany(
      {
        userId: req.userId,
      },
      {
        isDeleted: true,
      }
    ).session(session);
    console.log({ deleteReels });

    // Update Work Object
    const deleteAllWork = await WorkModel.updateMany(
      {
        userId: req.userId,
      },
      {
        workDeleted: true,
      }
    ).session(session);
    console.log({ deleteAllWork });

    // Update Follows Object
    const deleteFollow = await FollowModel.updateMany(
      {
        $or: [{ from: req.userId }, { to: req.userId }],
        status: "active",
      },
      {
        status: "block",
      }
    ).session(session);
    console.log({ deleteFollow });

    await session.commitTransaction();

    return next(
      CustomSuccess.createSuccess({}, "User Deleted Successfully", 200)
    );
  } catch (error) {
    await session.abortTransaction();

    console.log(error);
    return next(CustomError.createError(error.message, 500));
  } finally {
    await session.endSession();
  }
};

export const SearchProfile = async (req, res, next) => {
  console.log("hello");
  try {
    const { prompt } = req.query;
    const seachProfile = await UserModel.aggregate([
      {
        $match: {
          fullName: new RegExp(prompt, "i"),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "media",
          localField: "image",
          foreignField: "_id",
          as: "image",
        },
      },

      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $project: {
          fullName: 1,
          "image.mediaUrl": 1,
          "image._id": 1,
          email: 1,
          _id: 1,
        },
      },
    ]);

    return next(
      CustomSuccess.createSuccess(
        seachProfile,
        "Profile Fetched SuccessFully",
        200
      )
    );
  } catch (err) {
    return next(CustomError.createError(err.message, 500));
  }
};
