import { Schema, model } from 'mongoose'

const RoomSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
        required: true,
      },
    ],
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
      },
    ],
  },
  {
    timestamps,
  },
)

const RoomModel = model('Room', RoomSchema)

export default RoomModel
