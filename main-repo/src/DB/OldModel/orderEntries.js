import { Schema, model } from "mongoose";
import ProductModel from "./productModel.js";

const OrderEntrySchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Schema.Types.Number,
      default: 1,
      required: true,
    },
    price: {
      type: Schema.Types.Number,
      // required: true,
    },
    subTotal: {
      type: Schema.Types.Number,
      // required: true,
    },
  },
  {
    timestamps: true,
  },
);

OrderEntrySchema.pre("insertMany", async function (next, docs) {
  if (Array.isArray(docs) && docs.length) {
    const updateDocsArr = docs.map(async (doc) => {
      return new Promise(async (resolve, reject) => {
        const getPrice = await ProductModel.findOne({ _id: doc.product });
        if (!getPrice) {
          reject("insertMAny error occurred");
        }
        doc.price = Number(getPrice.price);
        doc.subTotal = Number(getPrice.price) * Number(doc.quantity);
        resolve(doc);
      });
    });
    docs = await Promise.all(updateDocsArr);
  }
  // console.log("Wow");
  next();
});

const OrderEntryModel = model("OrderEntry", OrderEntrySchema);

export default OrderEntryModel;
