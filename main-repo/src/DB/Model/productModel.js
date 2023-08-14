import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    category: {
      type: Schema.Types.String,
      required: true,
      enum: ["items", "materials"],
    },
    price: {
      type: Schema.Types.Number,
      required: true,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "Media",
        required: true,
      },
    ],
    isFeatured: {
      type: Schema.Types.Boolean,
      default: false,
      enum: [false, true],
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
      enum: [false, true],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    share: [{ type: Schema.Types.ObjectId, ref: "User" }],
    favourite: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // share: { type: Schema.Types.Number, default: 0 },
    // favourite: { type: Schema.Types.Number, default: 0 },
    expireFeaturedAt: {
      type: Schema.Types.Date,
      default: null,
      // index: { expires: "5m" },
    },
  },
  {
    timestamps: true,
  }
);

// ProductSchema.index({ expireFeaturedAt: 1 }, { expireAfterSeconds: 0 });

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
