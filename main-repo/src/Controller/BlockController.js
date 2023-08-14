import UserModel from "../DB/Model/userModel.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import {
  BlockUserValidator,
  UnBlockUserValidator,
} from "../Utils/Validator/BlockValidator.js";
import { Types } from "mongoose";

export const BlockUser = async (req, res, next) => {
  try {
    try {
      await BlockUserValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { users } = req.body;

    for (let i = 0; i < users.length; i++) {
      const element = users[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (users.find((item) => item == req.userId.toString())) {
      return next(CustomError.createError("You can not block yourself", 400));
    }

    const findUser = await UserModel.find({
      _id: { $in: users },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== users.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    const updateBlockUserList = await UserModel.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        $addToSet: {
          blockUsers: { $each: users },
        },
      }
    );
    return next(
      CustomSuccess.createSuccess({}, "User Blocked successfully", 201)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const UnBlockUser = async (req, res, next) => {
  try {
    try {
      await UnBlockUserValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    let { users } = req.body;

    for (let i = 0; i < users.length; i++) {
      const element = users[i];
      if (!checkMongooseId(element)) {
        return next(CustomError.createError("Invalid id provided", 400));
      }
    }

    if (users.find((item) => item == req.userId.toString())) {
      return next(CustomError.createError("You can not block yourself", 400));
    }

    const findUser = await UserModel.find({
      _id: { $in: users },
      isDeleted: false,
    }).lean();

    if (findUser?.length !== users.length) {
      return next(
        CustomError.createError("Not all user found with your given ids", 400)
      );
    }

    const updateBlockUserList = await UserModel.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        $pullAll: {
          blockUsers: users,
        },
      }
    );
    return next(
      CustomSuccess.createSuccess({}, "User UnBlocked successfully", 201)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const ListOfBlockUser = async (req, res, next) => {
  try {
    let blockUsersList = await UserModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(req.userId.toString()),
        },
      },

      {
        $project: {
          _id: 0,
          blockUsers: 1,
        },
      },
    ]);
    blockUsersList = await UserModel.populate(blockUsersList, [
      {
        path: "blockUsers",
        populate: "image",
        select: "fullName image",
      },
    ]);

    if (!blockUsersList[0]?.blockUsers?.length) {
      return next(CustomError.createError("No Block User found", 400));
    }

    return next(
      CustomSuccess.createSuccess(
        blockUsersList[0]?.blockUsers,
        "Block User list fetched successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};
