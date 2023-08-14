import { Schema, model } from "mongoose";
const BookingSchema = new Schema(
  {
    attendeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Sessions",
      required: true,
    },
    sessionInfoId: {
      type: Schema.Types.ObjectId,
      ref: "SessionInfo",
      required: true,
    },
    isAccepted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    paymentMade: {
      type: Schema.Types.Boolean,
      default: false,
    },
    pending: {
      type: Schema.Types.Boolean,
      default: true,
    },
    isRejected: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const BookingModel = model("SessionBooking", BookingSchema);
export default BookingModel;
