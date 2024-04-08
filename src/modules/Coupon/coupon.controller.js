import { DateTime } from "luxon";

import Coupon from "../../../DB/Models/coupon.model.js";
import CouponUsers from "../../../DB/Models/coupon-user.model.js";
import User from "../../../DB/Models/user.model.js";
import { applyCouponValidation } from "../../utils/coupon.validation.js";
import { couponStatus, systemRoles } from "../../utils/system-enums.js";

//============================== Add Coupon API ==============================//
/**
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.authUser  { _id:userId}
 * @returns  {message: "Coupon added successfully",coupon, couponUsers}
 * @description create coupon and couponUsers
 */
export const addCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    Users, // [{userId, maxUsage}]  => [{userId, maxUsage, couponId}]
  } = req.body;

  const { _id: addedBy } = req.authUser;

  //check users
  if (Users) {
    const userIds = [];
    for (const user of Users) {
      userIds.push(user.userId);
    }
    const isUserExist = await User.find({ _id: { $in: userIds } });
    if (isUserExist.length != Users.length)
      return next({
        message:
          "You are trying to add a coupon code to a user who does not exist!",
        cause: 404,
      });
  }
  // couponcode check
  const isCouponCodeExist = await Coupon.findOne({ couponCode });
  if (isCouponCodeExist)
    return next({ message: "Coupon code already exist", cause: 409 });

  if (isFixed == isPercentage)
    return next({
      message: "Coupon can be either fixed or percentage",
      cause: 400,
    });

  if (isPercentage) {
    if (couponAmount > 100)
      return next({
        message: "Percentage should be less than 100",
        cause: 400,
      });
  }

  const couponObject = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    addedBy,
  };

  const coupon = await Coupon.create(couponObject);

  //adding coupon to users
  if (Users) {
    const couponUsers = await CouponUsers.create(
      Users.map((ele) => ({ ...ele, couponId: coupon._id }))
    );
    return res
      .status(201)
      .json({ message: "Coupon added successfully", coupon, couponUsers });
  }
  return res.status(201).json({ message: "Coupon added successfully", coupon });
};

//================================ For Testing ================================//
export const validteCouponApi = async (req, res, next) => {
  const { couponCode } = req.body;
  const { _id: userId } = req.authUser; // const userId  = req.authUser._id

  // applyCouponValidation
  const isCouponValid = await applyCouponValidation(couponCode, userId);
  if (isCouponValid.status) {
    return next({
      message: isCouponValid.message,
      cause: isCouponValid.status,
    });
  }

  res.json({ message: "coupon is valid", coupon: isCouponValid });
};

//================================ Disable Coupon ================================//
export const disableCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  //find coupon
  const disabledCoupon = await Coupon.findById(couponId);
  if (!disabledCoupon)
    return next(new Error("Coupon not found!", { cause: 404 }));

  //check if coupon already enabled
  if (disabledCoupon.disabledAt)
    return next(new Error("This coupon is already disabled!", { cause: 400 }));
  //update disabledAt & disabledBy and save them in DB
  (disabledCoupon.disabledAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss")),
    (disabledCoupon.disabledBy = req.authUser._id),
    await disabledCoupon.save();
  //send response
  return res.status(200).json({
    success: true,
    message: "Coupon disabled successfully!",
    disabledCoupon,
  });
};

//================================ Enable Coupon ================================//
export const enableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  //find coupon
  const enabledCoupon = await Coupon.findById(couponId);
  if (!enabledCoupon)
    return next(new Error("Coupon not found!", { cause: 404 }));

  //check if coupon already enabled
  if (enabledCoupon.disabledAt)
    return next(new Error("This coupon is already disabled!", { cause: 400 }));
  //update disabledAt & disabledBy and save them in DB
  (enabledCoupon.enabledAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss")),
    (enabledCoupon.enabledBy = req.authUser._id),
    await enabledCoupon.save();
  //send response
  return res.status(200).json({
    success: true,
    message: "Coupon enabled successfully!",
    enabledCoupon,
  });
};

//================================ Get all disabled coupons ================================//
export const getAllDisabledCoupon = async (req, res, next) => {
  // 1- Get all disabled coupons
  const allDisabledCoupon = await Coupon.find({ disabledAt: { $ne: null } });
  if (!allDisabledCoupon.length)
    return next(
      new Error("There are no disabled coupons yet!", { cause: 404 })
    );
  //send response
  res.status(200).json({
    success: true,
    data: allDisabledCoupon,
  });
};
//================================ Get all enabled coupons   ================================//
export const getAllEnabledCoupon = async (req, res, next) => {
  // 1- Get all disabled coupons
  const allEnabledCoupon = await Coupon.find({ enabledAt: { $ne: null } });
  if (!allEnabledCoupon.length)
    return next(new Error("There are no enabled coupons yet!", { cause: 404 }));
  //send response
  res.status(200).json({
    success: true,
    data: allEnabledCoupon,
  });
};
//================================ Get coupon by id   ================================//
export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  //check coupon
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return next(new Error("Coupon not found!", { cause: 404 }));
  //send response
  return res.status(200).json({
    success: true,
    coupon,
  });
};
//================================ Update  Coupon   ================================//
export const updateCoupon = async (req, res, next) => {
  // destruct data from the user
  const { _id, role } = req.authUser;
  const { couponId } = req.params;
  // destruct data from the body
  const {
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    users,
  } = req.body;
  // check that coupon is found
  const coupon = await Coupon.findById({ _id: couponId });
  if (!coupon)
    return next({
      message: "Coupon not found!",
      cause: 404,
    });
  //check users is exist
  if (users) {
    await CouponUsers.deleteMany({ couponId });
    const userIds = [];
    for (const user of users) {
      userIds.push(user.userId);
    }
    const isUserExist = await User.find({ _id: { $in: userIds } });
    if (isUserExist.length != users.length)
      return next({
        message:
          "You are trying to add a coupon code to a user who does not exist!",
        cause: 404,
      });
  }
  // check if user want to update coupon
  if (couponCode) {
    // check that coupon code is duplicated
    if (couponCode != coupon.couponCode) {
      const couponCodeCheck = await Coupon.findOne({ couponCode });
      if (couponCodeCheck)
        return next(new Error("Coupon code already exists", { cause: 409 }));
    }
    coupon.couponCode = couponCode;
  }
  // check if user want to update couponAmount
  if (couponAmount) coupon.couponAmount = couponAmount;
  // check if user want to update fromDate
  if (fromDate) coupon.fromDate = fromDate;
  // check if user want to update toDate
  if (toDate) coupon.toDate = toDate;
  // check if user want to update isFixed
  if (isFixed) coupon.isFixed = isFixed;
  // check if user want to update isPercentage
  if (isPercentage) coupon.isPercentage = isPercentage;
  // check that coupon amount is valid
  if (coupon.isFixed == coupon.isPercentage && (isFixed || isPercentage))
    return next(
      new Error("Coupon amount must be either fixed or percentage!", {
        cause: 400,
      })
    );
  // is Percentage check
  if (coupon.isPercentage == true && coupon.couponAmount > 100)
    return next(
      new Error("Coupon amount must be less than 100!", { cause: 400 })
    );
  // save who that do updates
  coupon.updatedBy = _id;
  //save updates in DB
  await coupon.save();
  // asigned users
  if (users) {
    // create coupon-users
    const couponUsers = await CouponUsers.create(
      users.map((ele) => ({ ...ele, couponId: coupon._id }))
    );
    req.savedDocument = { model: CouponUsers, _id: couponUsers._id };
    // send response
    return res.status(202).json({
      message: "Coupon updated successfully",
      data: coupon,
      couponUsers,
    });
  }
  return res
    .status(202)
    .json({ meassage: "Coupon updated successfully", data: coupon });
};
