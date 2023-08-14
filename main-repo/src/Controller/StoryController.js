import { Types } from "mongoose";
import FollowModel from "../DB/Model/followModel.js";
import StoryModel from "../DB/Model/storyModel.js";
import UserModel from "../DB/Model/userModel.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
// import { GetStoriesByFollowingValidator } from "../Utils/Validator/StoryValidator.js";

// Add Story
export const AddStory = async (req, res, next) => {
  try {
    if (!req.file)
      next(
        CustomError.createError(
          "Something went wrong while uploading story",
          500
        )
      );

    const storyMedia = await uploadMedia(
      req.file.storyMedia,
      req.file.storyMediaType,
      req.userId,
      "Diyer"
    );

    if (!storyMedia)
      next(
        CustomError.createError(
          "Some Error occurred while uploading media",
          500
        )
      );

    const createStory = await StoryModel.create({
      ...req.file,
      storyMedia,
      expireStory: Date.now() + 24 * 60 * 60 * 1000,
    });

    return next(
      CustomSuccess.createSuccess(createStory, "Story created successfuly", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 200));
  }
};

// Get Diyer Stories
export const GetDiyerStory = async (req, res, next) => {
  try {
    let stories = await StoryModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(req.userId.toString()),
          isExpired: false,
          isDeleted: false,
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    stories = await StoryModel.populate(stories, [
      {
        path: "storyMedia",
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        stories,
        "Diyer story fetched successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

// Delete Story
export const DeleteDiyerStory = async (req, res, next) => {
  try {
    const storyIdArr = req.body.storyId;
    // const { storyId } = req.body;
    if (storyIdArr.length == 0) {
      return next(CustomError.createError("storyId is required", 400));
    }
    const findStory = await StoryModel.find({
      _id: {
        $in: storyIdArr,
      },
      userId: req.userId,
      isDeleted: false,
    }).lean();
    if (findStory.length !== storyIdArr.length) {
      return next(
        CustomError.createError(
          "Not all stories found. You have provided some wrong ids",
          400
        )
      );
    }
    const deleteStory = await StoryModel.updateMany(
      {
        _id: {
          $in: storyIdArr,
        },
        userId: req.userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      }
    ).lean();

    if (!deleteStory) {
      return next(
        CustomError.createError(
          "Not all stories found. You have provided some wrong ids",
          400
        )
      );
    }

    return next(
      CustomSuccess.createSuccess(
        // { deleteStory },
        {},
        "Stories deleted successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

// Get Stories by following

export const GetStoriesByFollowing = async (req, res, next) => {
  try {
    if (!checkMongooseId(req.userId))
      return next(CustomError.createError("Invalid id provided", 400));

    const findUser = await UserModel.findOne({
      _id: req.userId,
      isDeleted: false,
    });

    if (!findUser) return next(CustomError.createError("No User found", 400));

    const findFollowing = await FollowModel.find(
      {
        from: req.userId,
        status: "active",
      },
      {
        _id: 0,
        to: 1,
      }
    );
    console.log(findFollowing);

    const objectIdArray = findFollowing.map((item) => item.to);
    console.log(objectIdArray);

    let userStories = await StoryModel.aggregate([
      {
        $match: {
          userId: { $in: objectIdArray },

          isDeleted: false,
          isExpired: false,
        },
      },
      {
        $group: {
          _id: "$userId",
          stories: { $push: "$$ROOT" },
        },
      },
    ]);
    let userStories1 = await StoryModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(req.userId.toString()),
          isDeleted: false,
          isExpired: false,
        },
      },
      {
        $group: {
          _id: "$userId",
          stories: { $push: "$$ROOT" },
        },
      },
    ]);
    let arr = [...userStories1, ...userStories];
    arr = await StoryModel.populate(arr, [
      {
        path: "_id",
        model: "User",
        select: "fullName image email",
        populate: "image",
      },
      {
        path: "stories.storyMedia",
        model: "Media",
      },
    ]);

    await next(
      CustomSuccess.createSuccess(
        arr,
        "Following diyers stories fetched successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
