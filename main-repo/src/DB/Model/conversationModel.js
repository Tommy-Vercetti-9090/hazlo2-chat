import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reciever: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const conversationModel = model("Conversation", conversationSchema);
export default conversationModel;
