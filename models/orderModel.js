const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    orderItem: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        // status: {
        //   type: String,
        //   required: true
        // },
        // note: {
        //   type: String,
        //   default: "",
        // },
      },
    ],
    itemPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryType: {
      type: String,
      enum: ["shipping", "pickup"],
      required: true,
      default: "pickup",
    },
    shippingAddress: {
      type: String,
      required: function () {
        return this.deliveryType === "shipping";
      },
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card"],
      required: [true, "Payment method is required!"],
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Order = mongoose.model("orders", OrderSchema);
module.exports = Order;
