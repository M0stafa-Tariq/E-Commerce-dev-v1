import mongoose from "mongoose";
import { orderStatus, paymentMethod } from "../../src/utils/system-enums.js";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phoneNumbers: [{ type: String, required: true }],

    shippingPrice: { type: Number, required: true }, // array subtotal
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    totalPrice: { type: Number, required: true }, // shipping price - coupon is exits , not  = shipping price

    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethod),
      required: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(orderStatus),
      required: true,
      default: orderStatus.PENDING,
    },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: String },

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: String },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    cancelledAt: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    payment_intent: String,   
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
