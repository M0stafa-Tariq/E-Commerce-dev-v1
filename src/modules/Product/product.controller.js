import slugify from "slugify";

import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import { systemRoles } from "../../utils/system-enums.js";
import { APIFeatures } from "../../utils/api-features.js";

//============================================ Add product ============================================//
/**
 *
 * @param {*} req body: {title, desc, basePrice, discount, stock, specs}  authUser
 * @param {*} req query: {categoryId, subCategoryId, brandId}
 * @param {*} req authUser :{_id}
 * @returns the created product data with status 201 and success message
 * @description add a product to the database
 */

export const addProduct = async (req, res, next) => {
  // data from the request body
  const { title, desc, basePrice, discount, stock, specs } = req.body;
  // data from the request query
  const { categoryId, subCategoryId, brandId } = req.query;
  // data from the request authUser
  const addedBy = req.authUser._id;
  // brand check
  const brand = await Brand.findById(brandId);
  if (!brand) return next({ cause: 404, message: "Brand not found" });
  // category check
  if (brand.categoryId.toString() !== categoryId)
    return next({ cause: 400, message: "Brand not found in this category" });
  // sub-category check
  if (brand.subCategoryId.toString() !== subCategoryId)
    return next({
      cause: 400,
      message: "Brand not found in this sub-category",
    });

  // who will be authorized to add a product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    brand.addedBy.toString() !== addedBy.toString()
  )
    return next({
      cause: 403,
      message: "You are not authorized to add a product to this brand",
    });

  // generate the product  slug
  const slug = slugify(title, { lower: true, replacement: "-" }); //  lowercase: true

  //  applied price calculations
  const appliedPrice = basePrice - (basePrice * (discount || 0)) / 100;

  //Images
  if (!req.files?.length)
    return next({ cause: 400, message: "Images are required" });
  const Images = [];
  const folderId = generateUniqueString(4);
  const folderPath = brand.Image.public_id.split(`${brand.folderId}/`)[0];

  for (const file of req.files) {
    // ecommerce-project/Categories/4aa3/SubCategories/fhgf/Brands/5asf/z2wgc418otdljbetyotn
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(file.path, {
        folder: folderPath + `${brand.folderId}/Products/${folderId}`,
      });
    Images.push({ secure_url, public_id });
  }
  req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;
  // prepare the product object for db
  const product = {
    title,
    desc,
    slug,
    basePrice,
    discount,
    appliedPrice,
    stock,
    specs: JSON.parse(specs),
    categoryId,
    subCategoryId,
    brandId,
    addedBy,
    Images,
    folderId,
  };

  // create product document in DB
  const newProduct = await Product.create(product);
  req.savedDocument = { model: Product, _id: newProduct._id };

  if (!newProduct)
    return next(new Error("Puroduct creation failed", { cause: 400 }));
  // send response
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
};

//========================================= Update product =========================================//
/**
 *
 * @param {*} req body: {title, desc, basePrice, discount, stock, specs}
 * @param {*} req params : {productId}
 * @param {*} req authUser :{_id}
 * @returns the updated product data with status 200 and success message
 * @description update a product in the database
 */

export const updateProduct = async (req, res, next) => {
  // data from the request body
  const { title, desc, specs, stock, basePrice, discount, oldPublicId } =
    req.body;
  // data for condition
  const { productId } = req.params;
  // data from the request authUser
  const { _id } = req.authUser;
  // prodcuct Id
  const product = await Product.findById(productId);
  if (!product) return next({ cause: 404, message: "Product not found" });

  // who will be authorized to update a product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    product.addedBy.toString() !== _id.toString()
  )
    return next({
      cause: 403,
      message: "You are not authorized to update this product",
    });

  // title update
  if (title) {
    product.title = title;
    product.slug = slugify(title, { lower: true, replacement: "-" });
  }
  if (desc) product.desc = desc;
  if (specs) product.specs = JSON.parse(specs);
  if (stock) product.stock = stock;

  // prices changes
  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discount || product.discount) / 100);
  product.appliedPrice = appliedPrice;

  if (basePrice) product.basePrice = basePrice;
  if (discount) product.discount = discount;
  // if user want update imagess
  if (oldPublicId) {
    if (!req.file)
      return next({ cause: 400, message: "Please select new image" });

    const newPublicId = oldPublicId.split(`${product.folderId}`);

    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: newPublicId[0] + `${product.folderId}`,
        public_id: newPublicId[1],
      }
    );
    product.Images.map((img) => {
      if (img.public_id === oldPublicId) {
        img.secure_url = secure_url;
      }
    });
    req.folder = newPublicId[0] + `${product.folderId}`;
  }

  // set value for the updatedBy field
  product.updatedBy = _id;

  //save the updates in DB
  await product.save();
  //send response
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
};

//========================================= Delete product =========================================//
export const deleteProduct = async (req, res, next) => {
  // destructuring the request query
  const { productId } = req.params;
  // delete product
  const prodcuct = await Product.findByIdAndDelete(productId);
  if (!prodcuct) return next({ cause: 404, message: "product not found!" });
  //  delete the related reviews
  const reviews = await Review.deleteMany({ productId });
  if (reviews.deletedCount <= 0) {
    console.log("There is no related reviews");
  }
  // delete the brand folder from cloudinary
  const folderPath =
    prodcuct.Images[0].public_id.split(`${prodcuct.folderId}`)[0] +
    `${prodcuct.folderId}`;

  await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);
  await cloudinaryConnection().api.delete_folder(folderPath);
  // send response
  res
    .status(200)
    .json({ success: true, message: "Brand deleted successfully" });
};

//========================================= Get product by id =========================================//
export const getProductById = async (req, res, next) => {
  // destructuring the request query
  const { productId } = req.params;
  // search of product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));
  // send response
  res.status(200).json({
    success: true,
    data: product,
  });
};

//========================================= Get all products paginated =========================================//
export const getAllProductsPaginated = async (req, res, next) => {
  // destructuring the request query
  const { page, size } = req.query;
  //intiate new instance from APIFeatures
  const features = new APIFeatures(req.query, Product.find());
  //use pagination method from features
  features.pagination({ page, size });
  const products = await features.mogooseQuery;
  if (!products.length)
    return next(new Error("There are no products yet!", { cause: 404 }));
  // send response
  res.status(200).json({
    success: true,
    data: products,
  });
};

//========================================= search product =========================================//
export const searchProduct = async (req, res, next) => {
  // destructuring the request query
  const { ...search } = req.query;
  //intiate new instance from APIFeatures
  const features = new APIFeatures(req.query, Product.find()).search(search);
  //use search method from features
  const productsWithSearch = await features.mogooseQuery;
  if (!productsWithSearch.length)
    return next(
      new Error("There are no results match with your search!", { cause: 404 })
    );
  // send response
  res.status(200).json({
    success: true,
    data: productsWithSearch,
  });
};

//========================================= return all products for 2 specific brands =========================================//
export const allProductForTwoBrands = async (req, res, next) => {
  // destructuring the request query
  const { brandId1, brandId2 } = req.query;
  const products = await Product.find({
    brandId: { $in: [brandId1, brandId2] },
  });
  if (!products.length)
    return next(
      new Error("There is no result match with your search!", { cause: 404 })
    );
  res.status(200).json({
    success: true,
    data: products,
  });
};
