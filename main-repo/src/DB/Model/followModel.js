import { Schema, model } from "mongoose";

const FollowSchema = new Schema(
  {
    // followType: {
    //   type: Schema.Types.String,
    //   enum: ["follower", "following"],
    //   required: true,
    // },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ["active", "block", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const FollowModel = model("Follow", FollowSchema);

export default FollowModel;
