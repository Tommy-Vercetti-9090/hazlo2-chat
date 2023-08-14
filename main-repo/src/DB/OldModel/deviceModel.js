import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
  },
  deviceType: {
    type: String,
    enum: ["android", "ios", "web", "postman"],
    //O:andriod,1:IOS
  },
  deviceToken: {
    type: String,
    default: "",
  },
  lastSeen: {
    type: Date,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked", "loggedOut"],
  },
});
const DeviceModel = mongoose.model("Device", DeviceSchema);

export default DeviceModel;
