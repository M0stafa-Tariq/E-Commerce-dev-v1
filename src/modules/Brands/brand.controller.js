import slugify from "slugify";

import subCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

//============================== add brand ==============================//
export const addBrand = async (req, res, next) => {
  // 1- desturcture the required data from teh request object
  const { name } = req.body;
  const { categoryId, subCategoryId } = req.query;
  const { _id } = req.authUser;

  // 2- subcategory check
  const subCategoryCheck = await subCategory
    .findById(subCategoryId)
    .populate("categoryId", "folderId");
  if (!subCategoryCheck)
    return next({ message: "SubCategory not found", cause: 404 });

  // 3- duplicate brand document check
  const isBrandExists = await Brand.findOne({ name, subCategoryId });
  if (isBrandExists)
    return next({
      message: "Brand already exists for this subCategory",
      cause: 400,
    });

  // 4- categogry check
  if (categoryId != subCategoryCheck.categoryId._id) {
    return next({
      message: "Category not found, or not related about this subCategory! ",
      cause: 404,
    });
  }
  // 5 - generate the slug
  const slug = slugify(name, "-");

  // 6- upload brand logo
  if (!req.file)
    return next({ message: "Please upload the brand logo", cause: 400 });
  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    });
  // req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,

  // 7- brand object with latest updates
  const brandObject = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    subCategoryId,
    categoryId,
  };

  // 8- add brand in DB
  const newBrand = await Brand.create(brandObject);
  req.savedDocument = { model: Brand, _id: newBrand._id };
  if (!newBrand)
    return next(new Error("Brand creation failed!", { cause: 400 }));

  // 9- send response
  res.status(201).json({
    status: "success",
    message: "Brand added successfully",
    data: newBrand,
  });
};

//============================== update brand ==============================//
export const updateBrand = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, oldPublicId } = req.body;
  // 2- destructuring the request query
  const { brandId } = req.query;
  // 3- destructuring _id from the request authUser
  const { _id } = req.authUser;
  // 4- check if the Brand is exist by using brandId
  const brand = await Brand.findById(brandId).populate([
    { path: "subCategoryId", select: "folderId" },
    { path: "categoryId", select: "folderId" },
  ]);
  if (!brand) return next({ cause: 404, message: "Brand not found!" });

  // 5- check if the current user is the owner of brand
  if (_id.toString() !== brand.addedBy.toString())
    return next(
      new Error("You are not the owner of this brand,update doesn't allow!", {
        cause: 403,
      })
    );
  // 6- check if the use want to update the name field
  if (name) {
    // 6.1 check if the new category name different from the old name
    if (name == brand.name) {
      return next({
        cause: 400,
        message: "Please enter different brand name from the existing one.",
      });
    }

    // 6.2 check if the new brand name is already exist
    const isNameDuplicated = await Brand.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Brand name is already exist" });
    }

    // 6.3 update the brand name and the brand slug
    brand.name = name;
    brand.slug = slugify(name, "-");
  }

  // 7- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next(new Error("Image is required!", { cause: 400 }));

    const newPublicId = oldPublicId.split(`${brand.folderId}/`)[1];
    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`,
        public_id: newPublicId,
      }
    );

    brand.Image.secure_url = secure_url;
  }

  // 8- set value for the updatedBy field
  brand.updatedBy = _id;

  // 9- save the alternatives in DB
  await brand.save();

  // 10- send response
  res.status(200).json({
    success: true,
    message: "Brand updated successfully!",
    data: brand,
  });
};

//============================== get all brands ==============================//
export const getAllBrands = async (req, res, next) => {
  // 1- get all brands
  const allBrands = await Brand.find();
  if (!allBrands.length)
    return next(new Error("There are no brands yet!", { cause: 404 }));
  //send response
  res.status(200).json({
    success: true,
    data: allBrands,
  });
};

//============================== delete brand ==============================//
export const deleteBrand = async (req, res, next) => {
  // 1- destructuring the request query
  const { brandId } = req.params;
  // 2- delete brand
  const brand = await Brand.findByIdAndDelete(brandId).populate([
    { path: "categoryId", select: "folderId" },
    { path: "subCategoryId", select: "folderId" },
  ]);
  if (!brand) return next({ cause: 404, message: "brand not found!" });

  // 3- delete the related products
  const product = await Product.deleteMany({ brandId });
  if (product.deletedCount <= 0) {
    console.log("There is no related prodcuts");
  }
  // 4- delete the related reviews
  const reviews = await Review.deleteMany({ brandId });
  if (reviews.deletedCount <= 0) {
    console.log("There is no related reviews");
  }
  // 5- delete the brand folder from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`
  );
  // 6- send response
  res
    .status(200)
    .json({ success: true, message: "product deleted successfully!" });
};
