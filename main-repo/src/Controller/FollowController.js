import mongoose, { Types } from "mongoose";
import FollowModel from "../DB/Model/followModel.js";
import UserModel from "../DB/Model/userModel.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import {
  FollowAndUnFollowUserValidator,
  FollowUserValidator,
  GetFollowersValidator,
  GetFollowingValidator,
  RemoveFollowersValidator,
  UnFollowUserValidator,
} from "../Utils/Validator/FollowValidator.js";
import { PaginationValidator } from "../Utils/Validator/commonValidation.js";

export const FollowUser = async (req, res, next) => {
  // Create Session
  let session = await mongoose.startSession();
  try {
    try {
      await FollowUserValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { to } = req.body;

    for (let i = 0; i < to.length; i++) {
      const element = to[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (to.find((item) => item == req.userId.toString())) {
      return next(CustomError.createError("You can not follow yourself", 400));
    }

    const findUser = await UserModel.find({
      _id: { $in: to },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== to.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    session.startTransaction();
    // console.log(to);

    to = to.map((user) => {
      return {
        updateOne: {
          filter: {
            from: req.userId,
            to: user,
          },
          update: {
            from: req.userId,
            to: user,
            status: "active",
          },
          upsert: true,
        },
      };
    });

    const findFollowing = await FollowModel.bulkWrite(to, {
      session,
    });

    await session.commitTransaction();

    return next(CustomSuccess.createSuccess({}, "Follow successfully", 201));
  } catch (error) {
    await session.abortTransaction();

    console.log(error);
    return next(CustomError.createError(error.message, 500));
  } finally {
    await session.endSession();
  }
};

export const UnFollowUser = async (req, res, next) => {
  // Create Session
  let session = await mongoose.startSession();
  try {
    try {
      await UnFollowUserValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { to } = req.body;

    for (let i = 0; i < to.length; i++) {
      const element = to[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (to.find((item) => item == req.userId.toString())) {
      return next(
        CustomError.createError("You can not unfollow yourself", 400)
      );
    }

    const findUser = await UserModel.find({
      _id: { $in: to },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== to.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    session.startTransaction();
    to = to.map((user) => {
      return {
        updateOne: {
          filter: {
            from: req.userId,
            to: user,
          },
          update: {
            from: req.userId,
            to: user,
            status: "inactive",
          },
          upsert: true,
        },
      };
    });

    const findFollowing = await FollowModel.bulkWrite(to, {
      session,
    });

    await session.commitTransaction();

    return next(CustomSuccess.createSuccess({}, "UnFollow successfully", 201));
  } catch (error) {
    await session.abortTransaction();

    console.log(error);
    return next(CustomError.createError(error.message, 500));
  } finally {
    await session.endSession();
  }
};

export const FollowAndUnFollowUser = async (req, res, next) => {
  // Create Session
  let session = await mongoose.startSession();
  try {
    try {
      await FollowAndUnFollowUserValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { to, follow } = req.body;

    for (let i = 0; i < to.length; i++) {
      const element = to[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (to.find((item) => item == req.userId.toString())) {
      return next(
        CustomError.createError("You can not follow or unfollow yourself", 400)
      );
    }

    const findUser = await UserModel.find({
      _id: { $in: to },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== to.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    session.startTransaction();

    if (JSON?.parse(follow)) {
      to = to.map((user) => {
        return {
          updateOne: {
            filter: {
              from: req.userId,
              to: user,
            },
            update: {
              from: req.userId,
              to: user,
              status: "active",
            },
            upsert: true,
          },
        };
      });

      const findFollowing = await FollowModel.bulkWrite(to, {
        session,
      });

      await session.commitTransaction();

      return next(CustomSuccess.createSuccess({}, "Follow successfully", 201));
    } else {
      to = to.map((user) => {
        return {
          updateOne: {
            filter: {
              from: req.userId,
              to: user,
            },
            update: {
              from: req.userId,
              to: user,
              status: "inactive",
            },
            upsert: true,
          },
        };
      });

      const findFollowing = await FollowModel.bulkWrite(to, {
        session,
      });

      await session.commitTransaction();

      return next(
        CustomSuccess.createSuccess({}, "UnFollow successfully", 201)
      );
    }
  } catch (error) {
    await session.abortTransaction();

    console.log(error);
    return next(CustomError.createError(error.message, 500));
  } finally {
    await session.endSession();
  }
};

export const RemoveFollowers = async (req, res, next) => {
  // Create Session
  let session = await mongoose.startSession();
  try {
    try {
      await RemoveFollowersValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { to } = req.body;

    for (let i = 0; i < to.length; i++) {
      const element = to[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (to.find((item) => item == req.userId.toString())) {
      return next(CustomError.createError("You can not remove yourself", 400));
    }

    const findUser = await UserModel.find({
      _id: { $in: to },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== to.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    session.startTransaction();
    to = to.map((user) => {
      return {
        updateOne: {
          filter: {
            from: user,
            to: req.userId,
          },
          update: {
            from: user,
            to: req.userId,
            status: "inactive",
          },
          upsert: true,
        },
      };
    });

    const findFollowing = await FollowModel.bulkWrite(to, {
      session,
    });

    await session.commitTransaction();

    return next(
      CustomSuccess.createSuccess(
        {},
        "User Removed from Followers successfully",
        200
      )
    );
  } catch (error) {
    await session.abortTransaction();

    console.log(error);
    return next(CustomError.createError(error.message, 500));
  } finally {
    await session.endSession();
  }
};

export const GetFollowers = async (req, res, next) => {
  try {
    try {
      await GetFollowersValidator.validateAsync(req.params);
      await PaginationValidator.validateAsync(req.query);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    const { userId } = req.params;
    const { page } = req.query;

    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }

    let followers = await FollowModel.aggregate([
      {
        $match: {
          to: Types.ObjectId(userId.toString()),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "follows",
          let: {
            checkIsFollow: "$from",
            toFollow: "$to",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$to", "$$checkIsFollow"] },
                    { $eq: ["$from", "$$toFollow"] },
                  ],
                },
              },
            },
          ],
          as: "isFollowed",
        },
      },
      {
        $addFields: {
          isFollowed: {
            $in: [Types.ObjectId(userId.toString()), "$isFollowed.from"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: (Number(page) - 1) * 20,
      },
      {
        $limit: 20,
      },
    ]);

    followers = await FollowModel.populate(followers, [
      {
        path: "from",
        populate: "image",
        select: "fullName image",
      },
    ]);

    if (!followers?.length) {
      return next(CustomSuccess.createSuccess([], "No follower found", 200));
    }

    return next(
      CustomSuccess.createSuccess(
        followers,
        "Followers fetched successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const GetFollowing = async (req, res, next) => {
  try {
    try {
      await GetFollowingValidator.validateAsync(req.params);
      await PaginationValidator.validateAsync(req.query);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    const { userId } = req.params;
    const { page } = req.query;

    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }

    let following = await FollowModel.aggregate([
      {
        $match: {
          from: Types.ObjectId(userId.toString()),
          status: "active",
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: (Number(page) - 1) * 20,
      },
      {
        $limit: 20,
      },
    ]);

    following = await FollowModel.populate(following, [
      {
        path: "to",
        populate: "image",
        select: "fullName image",
      },
    ]);

    if (!following?.length) {
      return next(CustomSuccess.createSuccess([], "No following found", 200));
    }

    return next(
      CustomSuccess.createSuccess(
        following,
        "Following fetched successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};
