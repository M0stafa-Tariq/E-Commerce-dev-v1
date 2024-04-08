  import { DateTime } from "luxon";

import Order from "../../../DB/Models/order.model.js";
import CouponUsers from "../../../DB/Models/coupon-user.model.js";
import Product from "../../../DB/Models/product.model.js";
import Cart from "../../../DB/Models/cart.model.js";
import { applyCouponValidation } from "../../utils/coupon.validation.js";
import { checkProductAvailability } from "../Cart/utils/check-product-in-db.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import { orderStatus } from "../../utils/system-enums.js";
import { qrCodeGeneration } from "../../utils/qr-code.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import createInvoice from "../../utils/pdfkit.js";
import sendEmailService from "../../services/send-email.service.js";
import {
  confirmPaymentIntent,
  createCheckoutSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPaymentIntent,
} from "../../payment-handler/stripe.js";

//=================================add order====================================//
export const createOrder = async (req, res, next) => {
  //destructure the request body
  const {
    productId, // product id
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: userId } = req.authUser;

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await applyCouponValidation(couponCode, userId);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }
  // product check
  const isProductAvailable = await checkProductAvailability(
    productId,
    quantity
  );
  if (!isProductAvailable)
    return next({ message: "Product is not available", cause: 400 });

  let orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      productId,
    },
  ];

  //prices
  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    userId,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });
  //save order
  await order.save();
  req.savedDocument = { model: Order, _id: order._id };
  //update the quantitiy of the stock
  isProductAvailable.stock -= quantity;
  await isProductAvailable.save();
  //increment the usage counter of coupon
  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId },
      { $inc: { usageCount: 1 } }
    );
  }

  // generate QR code
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      userId,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);

  // create invoice
  const orderCode = `${req.authUser.username}_${generateUniqueString(3)}`;
  // generate inovice objdect
  const orderInvoice = {
    shipping: {
      name: req.authUser.username,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.city,
      country: order.shippingAddress.country,
    },
    orderCode,
    date: order.createdAt,
    items: order.orderItems,
    subTotal: order.shippingPrice,
    couponAmount: coupon?.couponAmount,
    paidAmount: order.totalPrice,
    couponId: coupon?._id,
  };

  createInvoice(orderInvoice, `${orderCode}.pdf`);

  // send invoice as mail to user
  await sendEmailService({
    to: req.authUser.email,
    subject: "Order confirmation",
    message: "<h1>Please find your invoice pdf below</h1>",
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  });

  //send response
  res.status(201).json({
    message: "Order created successfully",
    order,
    orderQR,
  });
};

//=================================conver cart to order====================================//
export const convertFromcartToOrder = async (req, res, next) => {
  //destructure the request body
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: userId } = req.authUser;
  // cart items
  const userCart = await getUserCart(userId);
  if (!userCart) return next({ message: "Cart not found", cause: 404 });

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await applyCouponValidation(couponCode, userId);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  //handle the order items
  let orderItems = userCart.products.map((cartItem) => {
    return {
      title: cartItem.title,
      quantity: cartItem.quantity,
      price: cartItem.basePrice,
      productId: cartItem.productId,
    };
  });

  //prices
  let shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    userId,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });
  //save order
  await order.save();
  req.savedDocument = { model: Order, _id: order._id };
  //delete cart after confirm the order
  await Cart.findByIdAndDelete(userCart._id);

  //decrement the quantity after confirm the order
  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }
  // update coupon usage count
  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId },
      { $inc: { usageCount: 1 } }
    );
  }
  // generate QR code
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      user: order.user,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);
  // create invoice
  const orderCode = `${req.authUser.username}-${generateUniqueString(3)}`;
  // order invoice
  const orderInvoice = {
    shipping: {
      name: req.authUser.username,
      address: order.shippingAddress.address,
      postalCode: order.shippingAddress.postalCode,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country,
    },
    orderCode,
    date: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
    items: order.orderItems,
    subTotal: order.shippingPrice,
    couponAmount: coupon?.couponAmount,
    paidAmount: order.totalPrice,
    couponId: coupon?._id,
  };
  await createInvoice(orderInvoice, `${orderCode}.pdf`);
  // send email
  await sendEmailService({
    to: req.authUser.email,
    subject: "Order Confirmation",
    message: "<h1>Check your Invoice Confirmation below</h1>",
    attachments: [{ path: `./Files/${orderCode}.pdf` }],
  });

  //send response
  res.status(201).json({ message: "Order created successfully", order,orderQR });
};

//=================================order delivery====================================//
export const deliverOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const updateOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: [orderStatus.PAID, orderStatus.PLACED] },
    },
    {
      orderStatus: "Delivered",
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
      deliveredBy: req.authUser._id,
      isDelivered: true,
    },
    {
      new: true,
    }
  );

  if (!updateOrder)
    return next({
      message: "Order not found or cannot be delivered",
      cause: 404,
    });

  res
    .status(200)
    .json({ message: "Order delivered successfully", order: updateOrder });
};

//=================================order payment with stipe====================================//
export const payWithStripe = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: userId } = req.authUser;

  // get order details from our database
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: orderStatus.PENDING,
  });
  console.log(order);
  if (!order)
    return next({ message: "Order not found or cannot be paid", cause: 404 });
  //preparing payment object
  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: { orderId: order._id.toString() },
    discounts: [],
    success_url: `${req.protocol}://${req.headers.host}/success`,
    cancel_url: `${req.protocol}://${req.headers.host}/cancel`,
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100, // in cents
        },
        quantity: item.quantity,
      };
    }),
  };
  // coupon check
  if (order.coupon) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.coupon });
    if (stripeCoupon.status)
      return next({ message: stripeCoupon.message, cause: 400 });

    paymentObject.discounts.push({
      coupon: stripeCoupon.id,
    });
  }
  //create payment session
  const checkoutSession = await createCheckoutSession(paymentObject);

  //create payment intent
  const paymentIntent = await createPaymentIntent({
    amount: order.totalPrice,
    currency: "EGP",
  });

  //save payment_intent in DB
  order.payment_intent = paymentIntent.id;
  await order.save();

  //send response
  res.status(200).json({
    success: true,
    result: { url: checkoutSession.url },
    paymentIntent,
  });
};

//======================apply webhook locally to confirm the order=======================//
export const stripeWebhookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;

  const confirmedOrder = await Order.findById(orderId);
  if (!confirmedOrder) return next({ message: "Order not found", cause: 404 });

  await confirmPaymentIntent({
    paymentIntentId: confirmedOrder.payment_intent,
  });

  confirmedOrder.isPaid = true;
  confirmedOrder.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  confirmedOrder.orderStatus = "Paid";

  await confirmedOrder.save();

  res.status(200).json({ message: "webhook received" });
};

//=================================refund payment with stipe====================================//
export const refundOrder = async (req, res, next) => {
  const { orderId } = req.params;
  //fetch order form DB
  const order = await Order.findOne({
    _id: orderId,
    orderStatus: orderStatus.PAID,
  });
  if (!order)
    return next({
      message: "Order not found or cannot be refunded",
      cause: 404,
    });

  // refund the payment intent
  const refund = await refundPaymentIntent({
    paymentIntentId: order.payment_intent,
  });
  //update order status on DB
  order.orderStatus = "Refunded";
  await order.save();
  //send resonse
  res
    .status(200)
    .json({ message: "Order refunded successfully", order: refund });
};

//=================================cancel order within 1 day====================================//
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id } = req.authUser;
  //check order
  const order = await Order.findById(orderId);
  if (!order) return next(new Error("Order not found!", { cause: 404 }));
  //check if the current user is the owner user
  if (order.userId.toString() != _id.toString()) {
    return next(
      new Error("You are not authorized to cancel this order", { cause: 401 })
    );
  }
  //chck if the order is already cancelled
  if (order.orderStatus == orderStatus.CANCELLED)
    return next({ message: "This order is already cancelled!", cause: 400 });
  // check that order is pending or placed || The request has more than a day
  if (
    (order.orderStatus != "Pending" && order.orderStatus != "Placed") ||
    order.createdAt < Date.now() - 24 * 60 * 60 * 1000
  ) {
    return next({ message: "You cannot cancel this order", cause: 400 });
  }
  // update order
  order.orderStatus = orderStatus.CANCELLED;
  order.cancelledAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  order.cancelledBy = _id;
  // save order
  await order.save();
  // product stock update
  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.quantity } }
    );
  }
  // update coupon usage count
  if (order.coupon) {
    await CouponUsers.updateOne(
      { couponId: order.coupon, userId: _id },
      { $inc: { usageCount: -1 } }
    );
  }
  // send response
  return res
    .status(200)
    .json({ message: "Order cancelled successfully", order });
};
