import { Schema, model } from "mongoose";

const preferenceSchema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      unique: true,
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
const PreferenceModel = model("Preference", preferenceSchema);

export default PreferenceModel;
