import { Schema, model } from "mongoose";

const ReelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reelMedia: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
    reelMediaType: {
      type: Schema.Types.String,
      enum: ["image", "video"],
      required: true,
    },
    reelMediaThumbnail: {
      type: Schema.Types.String,
      default: null,
    },
    expireReel: {
      type: Schema.Types.Date,
      required: true,
    },
    isExpired: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ReelSchema.index({ expireReel: 1 }, { expireAfterSeconds: 0 });

const ReelModel = model("Reel", ReelSchema);

export default ReelModel;
