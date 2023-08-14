import { Schema, model } from "mongoose";
const PostLikeSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

const PostLikesModel = model("PostLikes", PostLikeSchema);
export default PostLikesModel;
