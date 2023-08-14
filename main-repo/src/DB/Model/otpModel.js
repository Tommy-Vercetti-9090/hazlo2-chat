import { Schema, model } from "mongoose";
import { genSalt } from "../../Utils/saltGen.js";
import bcrypt from "bcrypt";

let OtpSchema = new Schema(
  {
    otpKey: {
      type: Schema.Types.String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otpUsed: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    verified: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    reason: {
      type: Schema.Types.String,
      required: true,
      enum: ["login", "verification", "forgotPassword"],
      default: "verification",
    },
    // expireAt: {
    //   type: Date,
    //   default: new Date(),
    //   expires: 60000,
    // },
  },
  {
    timestamps: true,
    // expireAfterSeconds: 10,
  }
);
// OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

OtpSchema.pre("save", async function (next) {
  if (this.isModified("otpKey")) {
    this.otpKey = bcrypt.hashSync(this.otpKey, genSalt);
  }
});

const OtpModel = model("Otp", OtpSchema);

export default OtpModel;
