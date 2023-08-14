import joi from "joi";
export const CreatePostValidator = joi.object({
  userId: joi.string().required(),
  postCaption: joi.string(),
  postMediaType: joi.string().equal("image", "video").required(),
});

export const ReportPostValidator = joi.object({
  postId: joi.string().required(),
});

export const HidePostValidator = joi.object({
  postId: joi.string().required(),
});

export const UpdatePostValidator = joi.object({
  postId: joi.string().required(),
  postCaption: joi.string().required(),
});

export const LikePostValidator = joi.object({
  postId: joi.string().required(),
});

export const CommentPostValidator = joi.object({
  postId: joi.string().required(),
  postComment: joi.string().required(),
});

export const DeleteCommentValidator = joi.object({
  commentId: joi.string().required(),
});

export const PaginationValidator = joi.object({
  page: joi.number().min(1).required(),
});

export const SharePostValidator = joi.object({
  postId: joi.string().required(),
  postCaption: joi.string(),
});

export const GetLikesValidator = joi.object({
  postId: joi.string().required(),
});

export const GetAllCommentsValidator = joi.object({
  postId: joi.string().required(),
});

export const DeletePostValidator = joi.object({
  postId: joi.string().required(),
});
export const SearchPostValidator = joi.object({
  prompt: joi.string(),
});

export const GetUserPostValidator = joi.object({
  userId: joi.string().required(),
});
