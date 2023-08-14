import { Schema, model } from "mongoose";

const StorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storyMedia: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
    storyMediaType: {
      type: Schema.Types.String,
      enum: ["image", "video"],
      required: true,
    },
    storyMediaThumbnail: {
      type: Schema.Types.String,
      default: null,
    },
    expireStory: {
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

StorySchema.index({ expireStory: 1 }, { expireAfterSeconds: 0 });

const StoryModel = model("Story", StorySchema);

export default StoryModel;
