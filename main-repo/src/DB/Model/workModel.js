import { Schema, model } from "mongoose";

const WorkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workMedia: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
    workMediaType: {
      type: Schema.Types.String,
      enum: ["image", "video"],
      required: true,
    },
    workMediaThumbnail: {
      type: Schema.Types.String,
      default: null,
    },
    workDeleted: {
      type: Schema.Types.Boolean,
      default: false,
      enum: [false, true],
    },
  },
  {
    timestamps: true,
  }
);

const WorkModel = model("Work", WorkSchema);

export default WorkModel;
