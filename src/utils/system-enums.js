// System roles
export const systemRoles = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
  DELIEVER_ROLE: "deliver",
};
// enum: ["valid", "expired"],

//Coupon status
export const couponStatus = {
  VALID: "valid",
  EXPIRED: "expired",
};

//Order status
export const orderStatus = {
  PENDING: "Pending",
  PAID: "Paid",
  DELIVERED: "Delivered",
  PLACED: "Placed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

//Payment method
export const paymentMethod = {
  CASH: "Cash",
  STRIPE: "Stripe",
  PAYMOB: "Paymob",
};
