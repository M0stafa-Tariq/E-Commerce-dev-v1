import Coupon from "../../DB/Models/coupon.model.js";
import CouponUsers from "../../DB/Models/coupon-user.model.js   ";
import { DateTime } from "luxon";

export async function applyCouponValidation(couponCode, userId) {
  // couponCodeCheck
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) return { message: "CouponCode not found", status: 400 };

  // couponStatus Check
  if (
    coupon.couponStatus == "expired" ||
    DateTime.fromISO(coupon.toDate) < DateTime.now()
  )
    return { message: "This coupon is expired", status: 400 };
  //check if coupoun enables
  if (!coupon.enabledAt)
    return { message: "This coupon doesn't enable yet", status: 400 };
  //check if coupoun disabled
  if (coupon.disabledAt)
    return { message: "This coupon is disabled", status: 400 };
  // start date check
  if (DateTime.now() < DateTime.fromISO(coupon.fromDate))
    return { message: "This coupon is not started yet", status: 400 };

  // user cases
  const isUserAssgined = await CouponUsers.findOne({
    couponId: coupon._id,
    userId,
  });
  if (!isUserAssgined)
    return { message: "This coupon is not assgined to you", status: 400 };

  // maxUsage Check
  if (isUserAssgined.maxUsage <= isUserAssgined.usageCount)
    return {
      message: "You have exceed the usage count for this coupon",
      status: 400,
    };

  return coupon;
}
