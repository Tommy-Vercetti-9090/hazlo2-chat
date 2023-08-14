import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    specs: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    price: {
      type: Schema.Types.Number,
      required: true,
    },
    // images: [
    //   {
    //     type: Schema.Types.String,
    //     required: true,
    //   },
    // ],
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
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
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    expireFeaturedAt: {
      type: Schema.Types.Date,
      // default: Date.now,
      // index: { expires: "5m" },
      // ref: "Vendor",
      // required: true,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ expireFeaturedAt: 1 }, { expireAfterSeconds: 0 });

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
