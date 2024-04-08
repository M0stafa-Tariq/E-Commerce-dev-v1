import Order from "../../../DB/Models/order.model.js";
import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";
import { orderStatus, systemRoles } from "../../utils/system-enums.js";

//=================================add review=================================//
export const addReview = async (req, res, next) => {
  const { _id: userId } = req.authUser;
  const { productId } = req.params;
  const { reviewRate, reviewComment } = req.body;
  //fetch product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));
  //check product stutas
  const isProductValidToBeReview = await Order.findOne({
    userId,
    "orderItems.productId": productId,
    orderStatus: orderStatus.DELIVERED,
  });
  if (!isProductValidToBeReview)
    return next(new Error("You should buy the product first!", { cause: 400 }));

  //prepare review object
  const reviewObj = {
    userId,
    productId,
    reviewRate,
    reviewComment,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    brandId: product.brandId,
  };

  //save the review in DB
  const reviewDB = await Review.create(reviewObj);
  if (!reviewDB)
    return next(new Error("Fail to add review to DB!", { cause: 400 }));
  //fetch reviews on that product
  const reviews = await Review.find({ productId });

  //count total rates on that porduct
  let sumOfRates = 0;
  for (const review of reviews) {
    sumOfRates += review.reviewRate;
  }
  //update reate on that productin DB
  product.rate = Number(sumOfRates / reviews.length).toFixed(2);
  await product.save();

  //send response
  res.status(201).json({
    success: true,
    reviewDB,
    product,
  });
};

//=================================Get all reviews for specific product=================================//
export const getAllReviewsForSpecificProduct = async (req, res, next) => {
  const { productId } = req.params;
  //fetch reviews
  const reviews = await Review.find({ productId });
  if (!reviews.length)
    next(
      new Error("There is no reviews related about this product!", {
        cause: 404,
      })
    );

  //send response
  res.status(200).json({ success: true, reviews });
};

//=================================delete review=================================//
export const deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { _id: userId, role } = req.authUser;
  //get review and delete
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) return new Error("Review not found!", { cause: 404 });
  
  //check if the current user is the owner of this review
  if (review.userId.toString() != userId.toString() && role == systemRoles.USER)
    return next(new Error("Not allow to you remove this review"));
  //get all reviews in this product
  const reviews = await Review.find({ productId: review.productId });
  if (!reviews.length)
    return next(
      new Error("There is no reviews related about this product!", {
        cause: 404,
      })
    );
  //get prodcut
  const product = await Product.findById(review.productId);
  //count total rates on that porduct
  let sumOfRates = 0;
  for (const review of reviews) {
    sumOfRates += review.reviewRate;
  }
  //update reate on that productin DB
  product.rate = Number(sumOfRates / reviews.length).toFixed(2);
  await product.save();

  //send response
  res.status(201).json({
    success: true,
    message: "Review deleted successfully!",
    product,
  });
};
