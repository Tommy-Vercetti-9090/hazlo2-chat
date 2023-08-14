import { Schema, model } from 'mongoose'

const ChatSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
      enum: [false, true],
    },
    message: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {     
    timestamps,
  },
)

const ChatModel = model('Chat', ChatSchema);

export default ChatModel
