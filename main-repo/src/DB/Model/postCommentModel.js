import { Schema, model } from "mongoose";
const PostCommentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postComment: {
      type: Schema.Types.String,
      default: null,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostCommentModel = model("PostComments", PostCommentSchema);
export default PostCommentModel;
