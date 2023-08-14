import { Schema, model } from "mongoose";

const DeviceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    deviceType: {
      type: Schema.Types.String,
      enum: ["android", "ios", "web", "postman"],
      //O:andriod,1:IOS
      required: true,
    },
    deviceToken: {
      type: Schema.Types.String,
      default: "",
    },
    // lastSeen: {
    //   type: Schema.Types.Date,
    //   default: "",
    // },
    status: {
      type: Schema.Types.String,
      enum: ["active", "inactive", "blocked", "loggedOut"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
const DeviceModel = model("Device", DeviceSchema);

export default DeviceModel;
