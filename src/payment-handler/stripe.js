import Stripe from "stripe";
import Coupon from "../../DB/Models/coupon.model.js";

// create a checkout session
export const createCheckoutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
  success_url,
  cancel_url,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email, //arguments
    metadata, //arguments
    success_url, //arguments
    cancel_url, //arguments
    discounts, //arguments
    line_items, //arguments
  });
  return paymentData;
};

// create a stripe coupon

export const createStripeCoupon = async ({ couponId }) => {
  const findCoupon = await Coupon.findById(couponId);
  if (!findCoupon) return { status: false, message: "Coupon not found" };

  let couponObject = {};
  if (findCoupon.isFixed) {
    couponObject = {
      name: findCoupon.couponCode,
      amount_off: findCoupon.couponAmount * 100,
      currency: "EGP",
    };
  }

  if (findCoupon.isPercentage) {
    couponObject = {
      name: findCoupon.couponCode,
      percent_off: findCoupon.couponAmount,
    };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const stripeCoupon = await stripe.coupons.create(couponObject);

  return stripeCoupon;
};

// create a stripe payment method
export const createStripePaymentMethod = async ({ token }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });
  return paymentMethod;
};

// create a stripe payment intent
export const createPaymentIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentMethod = await createStripePaymentMethod({ token: "tok_visa" });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};

// retrive a stripe payment intent
export const retrievePaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
};

// confirm a stripe payment intent
export const confirmPaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentDetails = await retrievePaymentIntent({ paymentIntentId });

  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentDetails.payment_method,
  });
  return paymentIntent;
};

// refund a stripe payment intent
export const refundPaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
  return refund;
};
