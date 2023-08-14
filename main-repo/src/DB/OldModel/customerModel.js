import { Schema, model } from "mongoose";

const CustomerSchema = new Schema(
  {
    //foriegn keys
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    // scaler fields
    name: {
      type: Schema.Types.String,
      required: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      // required:true
    },
    gender: {
      type: Schema.Types.String,
      enum: ["", "male", "female"],
      lowercase: true,
      trim: true,
      // required:true
      default: "",
    },
    mobile: {
      type: Schema.Types.Number,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // eslint-disable-next-line no-useless-escape
          return /^(1\s?)?(\d{3}|\(\d{3}\))[\s\-]?\d{3}[\s\-]?\d{4}$/.test(v);
        },
      },
      default: null,
      required: false,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
      default: null,
      // required:true
    },
    // location field for geolocation
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
    // relational fields
    // address: [
    //   {
    // type:mongoose.Schema.Types.ObjectId,
    // ref:'address'
    // required:true
    //   },
    // ],
    address: {
      type: Schema.Types.String,
      // required:true
    },
    reviews: [
      {
        // type:mongoose.Schema.Types.ObjectId,
        // ref:'buyerreview'
      },
    ],

    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    // following: [
    //   {
    //     // type:mongoose.Schema.Types.ObjectId,
    //     // ref:'vendor'
    //   },
    // ],
    // chats: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Chat',
    //   },
    // ],
    drafts: [
      {
        // type:mongoose.Schema.Types.ObjectId,
        // ref:'draft'
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wishlist",
        // required: true,
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const CustomerModel = model("Customer", CustomerSchema);

export default CustomerModel;
