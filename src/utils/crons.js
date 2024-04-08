import { scheduleJob } from "node-schedule";
import Coupon from "../../DB/Models/coupon.model.js";
import { DateTime } from "luxon";

export function cronToChangeExpiredCoupons() {
  scheduleJob("0 0 0 * * *", async () => {
    console.log("cronToChangeExpiredCoupons()  is running every 5 seconds");
    const coupons = await Coupon.find({ couponStatus: "valid" });
    for (const coupon of coupons) {
      if (DateTime.fromISO(coupon.toDate) < DateTime.now()) {
        coupon.couponStatus = "expired";
      }
      await coupon.save();
    }
  });
}
