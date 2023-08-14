import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    orderEntries: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderEntry",
        // required: true,
      },
    ],
    // total: {
    //   type: Schema.Types.Number,
    //   default: 0,
    //   required: true,
    // },
    status: {
      type: Schema.Types.String,
      enum: [
        "inQueue",
        "preparing",
        "awaitingDriver",
        "awaitingPickup",
        "inTransit",
        "delivered",
        "cancelled",
      ],
      default: "inQueue",
    },
    assignedDriver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      // required: true,
    },
    dropOffLocation: {
      type: Schema.Types.String,
      required: true,
    },
    pickUpLocation: {
      type: Schema.Types.String,
      // required: true,
    },
    paymentType: {
      type: Schema.Types.String,
      enum: ["cash on delivery", "online payment"],
      // required: true,
    },
    deliveryPrice: {
      type: Schema.Types.Number,
      // required: true,
    },
    review: {
      type: Schema.Types.Number,
      default: null,
      max: 5,
      // required: true,
    },
    // quantity: {
    //   type: Schema.Types.Number,
    //   default: 1,
    //   required: true,
    // },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // in options object we can //pass virtuals:true to get virtual properties in json
    toObject: { virtuals: true },
  },
);

OrderSchema.path("dropOffLocation").validate((val) => {
  const urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
}, "Invalid Drop Off URL.");
OrderSchema.path("pickUpLocation").validate((val) => {
  const urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
}, "Invalid Pick Up URL.");

OrderSchema.virtual(
  "totalPrice",
  //  {
  //   ref: "OrderEntry",
  //   localField: "orderEntries",
  //   foreignField: "_id",
  //   justOne: false,
  //   count: true,
  // }
).get(function (arr) {
  console.log("virtual :", arr);
  return this.orderEntries.reduce((acc, cur) => acc + cur.subTotal, 0);
  // Array.isArray(arr) ? arr.reduce((sum, el) => sum + el, 0) : 0;
  // return this.email.slice(this.email.indexOf('@') + 1);
});
// Add virtual field of total
const OrderModel = model("Order", OrderSchema);

export default OrderModel;
