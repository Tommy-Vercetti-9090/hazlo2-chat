import { Schema, model } from "mongoose";

const VendorSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      // required: true,
    },
    shopName: {
      type: Schema.Types.String,
      //   required: true,
    },
    currency: {
      type: Schema.Types.String,
      //   required: true,
    },
    language: {
      type: Schema.Types.String,
      //   required: true,
    },
    country: {
      type: Schema.Types.String,
      //   required: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      //   required: true,
    },
    auth: {
      // type: Schema.Types.ObjectId,
      type: Schema.Types.ObjectId,
      ref: "Auth",
      unique: true,
      // required: true,
    },
    canAddStory: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
      // required: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Follow",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    location: {
      type: {
        type: Schema.Types.String,
        enum: ["Point"],
        default: "Point",
        required: false,
      },
      coordinates: {
        type: [Schema.Types.Number],
        required: false,
      },
    },
    // chats: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Chat',
    //   },
    // ],
  },
  {
    timestamps: true,
  },
);

const VendorModel = model("Vendor", VendorSchema);

export default VendorModel;
