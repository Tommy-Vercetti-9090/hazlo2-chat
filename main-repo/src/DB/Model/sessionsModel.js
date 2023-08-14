import { Schema, model } from "mongoose";

const SessionsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionName: {
      type: String,
      required: true,
    },
    sessionDate: {
      type: Schema.Types.Date,
      required: true,
    },
    sessionInfo: [
      { type: Schema.Types.ObjectId, ref: "SessionInfo", },
    ],

  },
  
  {
    timestamps: true,
  }
);

const SessionsModel = model("Sessions", SessionsSchema);
export default SessionsModel;
