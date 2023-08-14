import { Schema, model } from "mongoose";
const SessionInfoSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Sessions",
      required: true,
    },
    limit: {
      type: Schema.Types.Number,
      required: true,
    },
    startTime: {
      type: Schema.Types.String,
      required: true,
    },
    endTime: {
      type: Schema.Types.String,
      required: true,
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: true,
    },
    price: {
      type: Schema.Types.Number,
      default: 20,
    },
    sessionType: {
      type: Schema.Types.String,
      enum: ["Public", "Private"],
      default: "Public",
    },
  },
  {
    timestamps: true,
  }
);

const SessionInfoModel = model("SessionInfo", SessionInfoSchema);
export default SessionInfoModel;
