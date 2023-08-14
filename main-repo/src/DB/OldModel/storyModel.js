import { Schema, model } from "mongoose";

const StorySchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    // auth: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Auth",
    //   required: true,
    // },
    media: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
    expireStory: {
      type: Schema.Types.Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

StorySchema.index({ expireStory: 1 }, { expireAfterSeconds: 0 });

const StoryModel = model("Story", StorySchema);

export default StoryModel;
