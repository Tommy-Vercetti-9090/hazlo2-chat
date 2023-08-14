import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: Schema.Types.String,
      default: "",
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const chatModel = model("Chat", chatSchema);

export default chatModel;
