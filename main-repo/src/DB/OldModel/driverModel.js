import { Schema, model } from "mongoose";

const DriverSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      //   required: true,
    },
    number: {
      type: Schema.Types.String,
      verify: {
        validator: function (v) {
          return /\d{3}-\d{3}-\d{4}/.test(v);
        },
      },
      //   required: true,
    },
    country: {
      type: Schema.Types.String,
      enum: ["USA", "UK", "Canada"],
      default: "USA",
      //   required: true,
    },
    driverStatus: {
      type: Schema.Types.String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    city: {
      type: Schema.Types.String,
      //   required: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      // default: "https://gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      //   required: true,
    },
    vehicleType: {
      type: Schema.Types.String,
      //   required: true,
    },
    vehicleNumber: {
      type: Schema.Types.String,
      //   required: true,
    },
    vehicleColor: {
      type: Schema.Types.String,
      //   required: true,
    },
    vehicleImage: {
      type: Schema.Types.String,
      //   required: true,
    },
    experience: {
      type: Schema.Types.String,
      //   required: true,
    },
    ride: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      // required: true,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
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

const DriverModel = model("Driver", DriverSchema);

export default DriverModel;
