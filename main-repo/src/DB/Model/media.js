import { Schema, model } from "mongoose";

const MediaSchema = new Schema(
  {
    mediaType: {
      type: Schema.Types.String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    mediaUrl: {
      type: Schema.Types.String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userType: {
      type: Schema.Types.String,
      enum: ["Admin", "Diyer"],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MediaModel = model("Media", MediaSchema);

export default MediaModel;
