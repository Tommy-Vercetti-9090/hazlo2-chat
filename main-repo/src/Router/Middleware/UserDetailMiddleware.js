import UserModel from "../../DB/Model/userModel.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";

// User Detail Middleware
export const UserDetailMiddleware = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      _id: req.userId,
    })
      .select(
        "fullName image email telephone socialIdentifier socialType socialAccessToken userType location userTags giveSession preferences devices wishList notificationOn isVerified isDeleted blockUsers"
      )
      .lean({ defaults: true });

    console.log({ UserDetailMiddleware: user });

    req.fullName = user.fullName;
    req.image = user.image;
    req.email = user.email;
    req.telephone = user.telephone;
    req.socialIdentifier = user.socialIdentifier;
    req.socialType = user.socialType;
    req.socialAccessToken = user.socialAccessToken;
    req.userType = user.userType;
    req.location = user.location;
    req.userTags = user.userTags;
    req.giveSession = user.giveSession;
    req.preferences = user.preferences;
    req.devices = user.devices;
    req.wishList = user.wishList;
    req.notificationOn = user.notificationOn;
    req.isVerified = user.isVerified;
    req.isDeleted = user.isDeleted;
    req.blockUsers = user.blockUsers;

    return next();
  } catch (error) {
    console.log(error);

    return next(CustomError.createError("No User Details found", 500));
  }
};

// import { Types } from "mongoose";
// import UserModel from "../../DB/Model/userModel.js";
// import CustomError from "../../Utils/ResponseHandler/CustomError.js";
// import CustomSuccess from "../../Utils/ResponseHandler/CustomSuccess.js";

// // User Detail Middleware
// export const UserDetailMiddleware = async (req, res, next) => {
//   try {
//     let user = await UserModel.aggregate([
//       {
//         $match: {
//           _id: Types.ObjectId(req.userId.toString()),
//           isDeleted: false,
//         },
//       },
//       {
//         $project: {
//           fullName: 1,
//           image: 1,
//           email: 1,
//           telephone: 1,
//           socialIdentifier: 1,
//           socialType: 1,
//           socialAccessToken: 1,
//           userType: 1,
//           location: 1,
//           userTags: 1,
//           giveSession: 1,
//           preferences: 1,
//           devices: 1,
//           wishList: 1,
//           notificationOn: 1,
//           isVerified: 1,
//           isDeleted: 1,
//           blockUsers: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { user_id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 blockUsers: { $in: [Types.ObjectId(req.userId.toString())] }, // _id: "$$user_id",
//               },
//             },
//             // {
//             //   $group: {
//             //     _id: "$_id",
//             //   },
//             // },
//             {
//               $project: {
//                 _id: 1,
//               },
//             },
//           ],
//           as: "blockByList",
//         },
//       },
//     ]);

//     user = user[0];

//     if (!user) {
//       return next(CustomError.createError("No User found", 404));
//     }

//     req.blockByList = user?.blockByList.map((item) =>
//       Types.ObjectId(item._id.toString())
//     );
//     req.fullName = user.fullName;
//     req.image = user.image;
//     req.email = user.email;
//     req.telephone = user.telephone;
//     req.socialIdentifier = user.socialIdentifier;
//     req.socialType = user.socialType;
//     req.socialAccessToken = user.socialAccessToken;
//     req.userType = user.userType;
//     req.location = user.location;
//     req.userTags = user.userTags;
//     req.giveSession = user.giveSession;
//     req.preferences = user.preferences;
//     req.devices = user.devices;
//     req.wishList = user.wishList;
//     req.notificationOn = user.notificationOn;
//     req.isVerified = user.isVerified;
//     req.isDeleted = user.isDeleted;
//     req.blockUsers = user.blockUsers;

//     return next();
//     // return next(CustomSuccess.createSuccess(user, "detail", 200));
//   } catch (error) {
//     console.log(error);

//     return next(CustomError.createError("No User Details found", 500));
//   }
// };

// // User Detail Function
// export const UserDetailFunction = async (userId) => {
//   try {
//     let user = await UserModel.aggregate([
//       {
//         $match: {
//           _id: Types.ObjectId(userId.toString()),
//           isDeleted: false,
//         },
//       },
//       {
//         $project: {
//           fullName: 1,
//           image: 1,
//           email: 1,
//           telephone: 1,
//           socialIdentifier: 1,
//           socialType: 1,
//           socialAccessToken: 1,
//           userType: 1,
//           location: 1,
//           userTags: 1,
//           giveSession: 1,
//           preferences: 1,
//           devices: 1,
//           wishList: 1,
//           notificationOn: 1,
//           isVerified: 1,
//           isDeleted: 1,
//           blockUsers: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { user_id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 blockUsers: { $in: [Types.ObjectId(userId.toString())] }, // _id: "$$user_id",
//               },
//             },
//             // {
//             //   $group: {
//             //     _id: "$_id",
//             //   },
//             // },
//             {
//               $project: {
//                 _id: 1,
//               },
//             },
//           ],
//           as: "blockByList",
//         },
//       },
//     ]);

//     user = user[0];

//     if (!user) {
//       return new Error("No User found");
//     }

//     user.blockByList = user?.blockByList.map((item) =>
//       Types.ObjectId(item._id.toString())
//     );

//     return user;
//   } catch (error) {
//     console.log(error);
//     return new Error("No User Details found");
//   }
// };
