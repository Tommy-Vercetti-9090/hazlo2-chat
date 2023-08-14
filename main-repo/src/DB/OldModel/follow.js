import { Schema, model } from "mongoose";

const FollowSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    userType: {
      type: Schema.Types.String,
      enum: ["Customer", "Driver"],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      refPath: "userType",
      required: true,
    },
  },
  {
    timestamps:true,
  },
);

const FollowModel = model("Follow", FollowSchema);

export default FollowModel;
