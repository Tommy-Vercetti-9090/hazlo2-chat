import { Schema, model } from "mongoose";

import bcrypt from "bcrypt";
import { genSalt } from "../../Utils/saltGen.js";

const UserSchema = new Schema(
  {
    fullName: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
    },
    email: {
      type: Schema.Types.String,
      // unique: true,
      trim: true,
      default: null,
    },
    telephone: {
      type: Schema.Types.String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // eslint-disable-next-line no-useless-escape
          return /^(1\s?)?(\d{3}|\(\d{3}\))[\s\-]?\d{3}[\s\-]?\d{4}$/.test(v);
        },
      },
      // unique: true,
      trim: true,
      default: null,
    },
    password: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    socialIdentifier: {
      type: Schema.Types.String,
      default: null,
    },
    socialType: {
      type: Schema.Types.String,
      enum: ["apple", "facebook", "google", ""],
      default: "",
    },
    socialAccessToken: {
      type: Schema.Types.String,
      trim: true,
      default: null,
    },
    userType: {
      type: Schema.Types.String,
      enum: ["Admin", "Diyer"],
      default: "Diyer",
      // required: true,
    },
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
    description: {
      type: Schema.Types.String,
      default: null,
    },
    address: {
      type: Schema.Types.String,
      default: null,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
      default: null,
    },
    userTimeZone: {
      type: Schema.Types.String,
      default: null,
    },
    userTags: [
      {
        type: Schema.Types.String,
      },
    ],
    giveSession: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    // followers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Follow",
    //   },
    // ],
    // following: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Follow",
    //   },
    // ],

    preferences: [
      {
        type: Schema.Types.ObjectId,
        ref: "Preference",
      },
    ],
    devices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
    loggedOutDevices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
    wishList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wishlist",
      },
    ],
    blockUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notificationOn: {
      type: Schema.Types.Boolean,
      default: true,
    },
    isVerified: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, genSalt);
  }
  if (this.isModified("socialAccessToken")) {
    this.socialAccessToken = bcrypt.hashSync(this.socialAccessToken, genSalt);
  }
  if (this.isModified("socialIdentifier")) {
    this.socialIdentifier = bcrypt.hashSync(this.socialIdentifier, genSalt);
  }

  next();
});

const UserModel = model("User", UserSchema);

export default UserModel;
