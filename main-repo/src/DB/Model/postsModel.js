import { Schema, model } from "mongoose";
const PostsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postMedia: [
      {
        type: Schema.Types.ObjectId,
        ref: "Media",
        // required: true,
      },
    ],
    postMediaType: {
      type: Schema.Types.String,
      enum: ["image", "video"],
      //required: true,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    postCaption: {
      type: Schema.Types.String,
      default: null,
    },
    reported: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    hidePost: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    postThumbnail: {
      type: Schema.Types.String,
      default: null,
    },
    isShared: {
      type: Schema.Types.Boolean,
      default: false,
    },
    originalPost: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PostsModel = model("Posts", PostsSchema);

export default PostsModel;
