import CustomError from "../Utils/ResponseHandler/CustomError.js";
import {
  CreatePostValidator,
  ReportPostValidator,
  HidePostValidator,
  UpdatePostValidator,
  PaginationValidator,
  CommentPostValidator,
  DeleteCommentValidator,
  GetAllCommentsValidator,
  SharePostValidator,
  GetLikesValidator,
  DeletePostValidator,
  LikePostValidator,
  SearchPostValidator,
} from "../Utils/Validator/PostsValidator.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import PostsModel from "../DB/Model/postsModel.js";
import PostCommentModel from "../DB/Model/postCommentModel.js";
import PostLikesModel from "../DB/Model/postLikesModel.js";
import UserModel from "../DB/Model/userModel.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import { Types } from "mongoose";
import { unlinkSync } from "fs";
import mongoose from "mongoose";
import { generateThumbnail } from "../Router/Middleware/UploadPostMiddleware.js";

//Create a new Post

export const CreatePost = async (req, res, next) => {
  try {
    const files = req.files;
    const filesLength = files.length;
    await CreatePostValidator.validateAsync(req.body);
    if (!files || filesLength === 0) {
      return next(CustomError.createError("No file provided to post", 400));
    }

    if (files[0].mimetype.includes("video")) {
      var mediaThumbnail = await generateThumbnail(files[0]);

      const uploadPostVideo = await uploadMedia(
        files[0],
        "video",
        req.body.userId,
        "Diyer"
      );
      var videoUrl = await Promise.resolve(uploadPostVideo);
    } else {
      const mediaToDB = files.map(async (file) => {
        const mediaUrl = await uploadMedia(file, "image", req.userId, "Diyer");
        return mediaUrl;
      });
      var allMediaUrl = await Promise.all([...mediaToDB]);
    }

    const createPost = await PostsModel.create({
      ...req.body,
      userId: req.userId,
      postMedia: files[0].mimetype.includes("video")
        ? videoUrl
        : [...allMediaUrl],
      postCaption: req.body.postCaption,
      postMediaType: req.body.postMediaType,
      postThumbnail: mediaThumbnail,
    });

    return next(
      CustomSuccess.createSuccess(createPost, "Post Created Successfully", 200)
    );
  } catch (error) {
    if (req?.files) {
      req.files.map((obj) => {
        unlinkSync(obj.path);
      });
    }
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

//SEARCH POST:
export const SearchPost = async (req, res, next) => {
  try {
    const { body } = req;

    await SearchPostValidator.validateAsync(body);
    const search = await PostsModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$userId",
      },

      {
        $lookup: {
          from: "media",
          localField: "postMedia",
          foreignField: "_id",
          as: "postMedia",
        },
      },
      {
        $match: {
          postCaption: new RegExp(body.prompt),
          isDeleted: false,
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $project: {
          "userId.fullName": 1,
          "userId.image": 1,
          "userId.email": 1,
          _id: 1,
          postMedia: 1,
          postMediaType: 1,
          postCaption: 1,
          postThumbnail: 1,
        },
      },
    ]);
    return next(
      CustomSuccess.createSuccess(search, "Searched Posts Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
//GET ALL POSTS
export const GetAllPosts = async (req, res, next) => {
  try {
    const { page } = req.query;
    await PaginationValidator.validateAsync(req.query);
    const user = await UserModel.findOne({
      _id: Types.ObjectId(req.userId.toString()),
    }).select("blockUsers");

    let allPosts = await PostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          reported: { $nin: [Types.ObjectId(req.userId.toString())] },
          hidePost: { $nin: [Types.ObjectId(req.userId.toString())] },
          userId: { $nin: user.blockUsers },
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postcomments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          isLiked: {
            $in: [Types.ObjectId(req.userId.toString()), "$likes.userId"],
          },
        },
      },
      {
        $unset: ["likes", "comments"],
      },
      {
        $sort: { updatedAt: 1 },
      },
      {
        $skip: (Number(page) - 1) * 10,
      },
      {
        $limit: 10,
      },
    ]);
    allPosts = await PostsModel.populate(allPosts, [
      {
        path: "userId",
        model: "User",
        select: "fullName image",
        populate: "image",
      },
      {
        path: "postMedia",
        model: "Media",
      },
      {
        path: "originalPost",
        model: "Posts",
        select: "postMedia postCaption postThumbnail userId",

        populate: [
          {
            path: "postMedia",
            select: "mediaType mediaUrl",
            model: "Media",
          },
          {
            path: "userId",
            select: "fullName image",
            model: "User",
            populate: "image",
          },
        ],
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        allPosts,
        "All posts fetched successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
//REPORT POST
export const ReportPost = async (req, res, next) => {
  try {
    await ReportPostValidator.validateAsync(req.body);
    const userId = req.userId;

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    let report = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { reported: userId } },
      {
        new: true,
      }
    );

    if (!report) {
      return next(CustomError.createError("Post not found", 200));
    }
    return next(
      CustomSuccess.createSuccess(report, "Post reported successfully", 200)
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
//HIDE POST
export const HidePost = async (req, res, next) => {
  try {
    await HidePostValidator.validateAsync(req.body);
    const userId = req.userId;
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    let hide = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { hidePost: userId } },
      {
        new: true,
      }
    );
    if (!hide) {
      return next(CustomError.createError("Post does not exist", 200));
    }
    return next(
      CustomSuccess.createSuccess(hide, "Post hidden successfully", 200)
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};

//UPDATE POST
export const UpdatePost = async (req, res, next) => {
  try {
    await UpdatePostValidator.validateAsync(req.body);
    const userId = req.userId;
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    let updatePost = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      {
        $set: {
          postCaption: req.body.postCaption,
        },
      },
      {
        new: true,
      }
    );
    if (!updatePost) {
      return next(CustomError.createError("Post Does Not Exist", 200));
    }
    return next(
      CustomSuccess.createSuccess(updatePost, "Post hidden successfully", 200)
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
//LIKE POST
export const LikePost = async (req, res, next) => {
  try {
    await LikePostValidator.validateAsync(req.body);
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId });
    if (!checkPost) {
      return next(CustomError.createError("Post Does Not exist", 400));
    }
    const likePost = await PostLikesModel.findOne({
      postId: req.body.postId,
      userId: req.userId,
    });
    if (likePost) {
      let removeLike = await PostLikesModel.findOneAndRemove({
        postId: req.body.postId,
        userId: req.userId,
      });
      return next(
        CustomSuccess.createSuccess(
          removeLike,
          "Like Removed Successfully",
          200
        )
      );
    } else {
      var likedPost = await PostLikesModel.create({
        postId: req.body.postId,
        userId: req.userId,
      });
      return next(
        CustomSuccess.createSuccess(likedPost, "Post liked successfully", 200)
      );
    }
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
//COMMENT POST
export const CommentPost = async (req, res, next) => {
  try {
    await CommentPostValidator.validateAsync(req.body);
    const userId = req.userId;
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId });
    if (!checkPost) {
      return next(CustomError.createError("Post Does Not exist", 400));
    }
    let commentPost = await PostCommentModel.create({
      postId: req.body.postId,
      userId: userId,
      postComment: req.body.postComment,
    });
    commentPost = await PostCommentModel.populate(commentPost, [
      {
        path: "userId",
        model: "User",
        select: "fullName",
        populate: {
          path: "image",
          select: "mediaUrl",
        },
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        commentPost,
        "Commented on posted successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 200));
  }
};
//DELETE COMMENT
export const DeleteComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    await DeleteCommentValidator.validateAsync(req.body);
    if (!checkMongooseId(req.body.commentId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkComment = await PostCommentModel.find({
      _id: req.body.commentId,
      userId: userId,
    });
    if (checkComment.length == 0) {
      return next(CustomError.createError("Comment Does Not exist", 400));
    }
    var deleteComment = await PostCommentModel.deleteOne({
      _id: req.body.commentId,
      userId: userId,
    });

    if (deleteComment.deletedCount == 0) {
      return next(
        CustomError.createError("Invalid commentId or userId provided", 400)
      );
    }
    return next(
      CustomSuccess.createSuccess(
        deleteComment,
        "Comment deleted successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 400));
  }
};
// GET ALL COMMENTS
export const GetAllComments = async (req, res, next) => {
  try {
    const { postId } = req.query;
    await GetAllCommentsValidator.validateAsync(req.query);
    if (!checkMongooseId(postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkPost = await PostsModel.findById(postId);
    if (!checkPost) {
      return next(CustomError.createError("Post Does Not Exist", 400));
    }
    let allComments = await PostCommentModel.find({
      postId: postId,
    });
    allComments = await PostCommentModel.populate(allComments, [
      {
        path: "userId",
        model: "User",
        select: "fullName",
        populate: {
          path: "image",
          select: "mediaUrl",
        },
      },
    ]);

    if (!allComments) {
      return next(CustomError.createError("Invalid postId provided", 400));
    }
    return next(
      CustomSuccess.createSuccess(
        allComments,
        "All comments fetched successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 400));
  }
};
//SHARE POST
export const SharePost = async (req, res, next) => {
  try {
    await SharePostValidator.validateAsync(req.body);
    const userId = req.userId;

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId });
    if (!checkPost) {
      return next(CustomError.createError("Post Does Not exist", 400));
    }
    const sharedPost = await PostsModel.create({
      postCaption: req.body.postCaption,
      originalPost: req.body.postId,
      userId: userId,
      isShared: true,
    });

    if (!sharedPost) {
      return next(CustomError.createError("sharing failed", 400));
    }
    return next(
      CustomSuccess.createSuccess(sharedPost, "Post Shared Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};
// GET LIKE ON POST
export const GetLikesOnPost = async (req, res, next) => {
  try {
    const { postId } = req.query;
    await GetLikesValidator.validateAsync(req.query);
    if (!checkMongooseId(postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const listOfLikes = await PostLikesModel.find({ postId: postId });
    if (listOfLikes) {
      const listOfUsers = await PostLikesModel.populate(listOfLikes, [
        {
          path: "userId",
          model: "User",
          select: "fullName image",
          populate: "image",
        },
      ]);

      return next(
        CustomSuccess.createSuccess(listOfUsers, "List of likes on Post", 200)
      );
    }
    return next(CustomError.createError("Something went wrong", 400));
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};
//DELETE POST

export const DeletePost = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await DeletePostValidator.validateAsync(req.query);
    const { postId } = req.query;
    if (!checkMongooseId(postId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }
    const checkOwner = await PostsModel.findOne(
      {
        _id: postId,
        userId: req.userId,
      },
      null,
      {
        session,
      }
    );
    if (!checkOwner) {
      await session.abortTransaction();
      return next(
        CustomError.createError("You are not the creator of this post", 400)
      );
    }
    const findSharedPost = await PostsModel.find(
      {
        originalPost: postId,
        isShared: true,
      },
      null,
      {
        session,
      }
    );

    if (findSharedPost.length > 0) {
      await PostsModel.updateMany(
        { originalPost: postId },
        { $set: { originalPost: null } },
        {
          session,
          new: true,
          upsert: true,
        }
      );
    }

    const originalPost = await PostsModel.findOneAndDelete(
      { _id: postId, userId: req.userId },

      {
        session,
        new: true,
      }
    );
    const deleteLikes = await PostLikesModel.deleteMany({ postId: postId });
    if (!deleteLikes) {
      await session.abortTransaction();
      return next(CustomError.createError("Likes Not removed", 400));
    }
    const deleteComments = await PostCommentModel.deleteMany({
      postId: postId,
    });
    if (!deleteComments) {
      await session.abortTransaction();
      return next(CustomError.createError("Comments Not removed", 400));
    }

    if (originalPost) {
      await session.commitTransaction();
      return next(
        CustomSuccess.createSuccess(originalPost, "Original Post Deleted", 200)
      );
    }
    await session.abortTransaction();
    return next(CustomError.createError("Something went wrong", 400));
  } catch (error) {
    await session.abortTransaction();
    return next(CustomError.createError(error.message, 400));
  } finally {
    await session.endSession();
  }
};

export const GetYourPost = async (req, res, next) => {
  try {
    // const { userId } = req.body;
    const user_id = req.userId;
    const { page, id } = req.query;
    let UserPosts = await PostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          userId: Types.ObjectId(id.toString()),
          reported: { $nin: [Types.ObjectId(user_id.toString())] },
          hidePost: { $nin: [Types.ObjectId(user_id.toString())] },
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "postcomments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
        },
      },
      {
        $unset: ["likes", "comments"],
      },
      {
        $sort: { updatedAt: 1 },
      },
      {
        $skip: (Number(page) - 1) * 10,
      },
      {
        $limit: 10,
      },
    ]);
    if (!UserPosts) {
      return next(CustomSuccess.createSuccess("No Posts exist", 200));
    }
    console.log("------------>", UserPosts);
    UserPosts = await PostsModel.populate(UserPosts, [
      {
        path: "userId",
        model: "User",
        select: "fullName image",
        populate: "image",
      },
      {
        path: "postMedia",
        model: "Media",
      },
      {
        path: "originalPost",
        model: "Posts",
        select: "postMedia postCaption postThumbnail userId",

        populate: [
          {
            path: "postMedia",
            select: "mediaType mediaUrl",
            model: "Media",
          },
          {
            path: "userId",
            select: "fullName image",
            model: "User",
            populate: "image",
          },
        ],
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        UserPosts,
        "User all posts fetched successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};
