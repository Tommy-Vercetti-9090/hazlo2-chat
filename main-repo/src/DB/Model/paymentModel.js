import { Schema, model } from "mongoose";
const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cutomerId: {
      type: Schema.Types.String,
      requried: true,
    },
    accountId: {
      type: Schema.Types.String,
      requried: true,
    },
    cardToken: {
      type: Schema.Types.String,
      requried: false,
    },
    isSaved: {
      type: Schema.Types.Boolean,
      default: false,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentInfoModel = model("PaymentInfo", PaymentSchema);
export default PaymentInfoModel;
