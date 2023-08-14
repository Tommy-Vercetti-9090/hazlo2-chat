import { Schema, model } from "mongoose";
import moment from "moment";

const schema = new Schema({
  convId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Coversation",
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: Schema.Types.String,
  },
  sentAt: {
    type: moment().toISOString() ?? Date.now(),
  },
  isRead: {
    type: Schema.Types.Boolean,
    default: false,
  },
});

const messageSchema = model("Messages", schema);

export default messageSchema;
