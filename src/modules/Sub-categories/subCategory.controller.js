import SubCategory from "../../../DB/Models/sub-category.model.js";
import Category from "../../../DB/Models/category.model.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import slugify from "slugify";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name } = req.body;
  const { categoryId } = req.params;
  const { _id } = req.authUser;

  // 2- check if the subcategory name is already exist
  const isNameDuplicated = await SubCategory.findOne({ name });
  if (isNameDuplicated) {
    return next({ cause: 409, message: "SubCategory name is already exist" });
    // return next( new Error('Category name is already exist' , {cause:409}) )
  }

  // 3- check if the category is exist by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return next({ cause: 404, message: "Category not found" });

  // 4- generate the slug
  const slug = slugify(name, "-");

  // 5- upload image to cloudinary
  if (!req.file) return next({ cause: 400, message: "Image is required" });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`,
    });
  req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`;
  // 6- generate the subCategory object
  const subCategory = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    categoryId,
  };
  // 7- create the subCategory
  const subCategoryCreated = await SubCategory.create(subCategory);
  req.savedDocument = { model: SubCategory, _id: subCategoryCreated._id };
  if (!subCategoryCreated)
    return next(new Error("SubCategory Creation failed!", { cause: 400 }));

  // 8-send response
  res.status(201).json({
    success: true,
    message: "subCategory created successfully",
    data: subCategoryCreated,
  });
};

//============================== update SubCategory ==============================//
export const updateSubCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, oldPublicId } = req.body;
  // 2- destructuring the request query
  const { subCategoryId, categoryId } = req.query;
  // 3- destructuring _id from the request authUser
  const { _id } = req.authUser;
  // 4- check if the subCategory is exist by using subCategoryId
  const subCategory = await SubCategory.findById(subCategoryId).populate([
    { path: "categoryId", select: "folderId" },
  ]);
  if (!subCategory)
    return next({ cause: 404, message: "SubCategory not found!" });

  // 5- check if the use want to update the name field
  if (name) {
    // 5.1 check if the new category name different from the old name
    if (name == subCategory.name) {
      return next({
        cause: 400,
        message:
          "Please enter different subCtegory name from the existing one.",
      });
    }

    // 5.2 check if the new subCategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "SubCategory name is already exist" });
    }

    // 5.3 update the subCategory name and the subCategory slug
    subCategory.name = name;
    subCategory.slug = slugify(name, "-");
  }

  // 6- check if the use want to update the categoryId field
  // if (categoryId) {
  //   //check if category exists
  //   const category = await Category.findById(categoryId);
  //   if (!category)
  //     return next(
  //       new Error("You are trying to assign a category that does not exist! ", {
  //         cause: 404,
  //       })
  //     );
  //   //update the categoryId
  //   subCategory.categoryId = categoryId;
  // }

  // 7- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next(new Error("Image is required!", { cause: 400 }));

    const newPublicId = oldPublicId.split(`${subCategory.folderId}/`)[1];
    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`,
        public_id: newPublicId,
      }
    );

    subCategory.Image.secure_url = secure_url;
  }

  // 8- set value for the updatedBy field
  subCategory.updatedBy = _id;

  // 9- save the alternatives in DB
  await subCategory.save();

  // 10- send response
  res.status(200).json({
    success: true,
    message: "SubCategory updated successfully!",
    data: subCategory,
  });
};

//============================== get all SubCategoies with brands ==============================//
export const getAllSubCategoriesWithBrands = async (req, res, next) => {
  // 1- get all subCategories with brands
  const allSubCategoriesWithBrands = await SubCategory.find().populate([
    { path: "brands" },
  ]);
  if (!allSubCategoriesWithBrands.length)
    return next(new Error("There are no subCategories yet!", { cause: 404 }));
  //send response
  res.status(200).json({
    success: true,
    data: allSubCategoriesWithBrands,
  });
};

//============================== delete SubCategory ==============================//
export const deleteSubCategory = async (req, res, next) => {
  // 1- destructuring the request query
  const { subCategoryId } = req.params;
  // 2- delete subCategory
  const subCategory = await SubCategory.findByIdAndDelete(
    subCategoryId
  ).populate([{ path: "categoryId", select: "folderId" }]);
  if (!subCategory) return next({ cause: 404, message: "Category not found" });
  // 3- delete the related brands
  const brands = await Brand.deleteMany({ subCategoryId });
  if (brands.deletedCount <= 0) {
    console.log("There is no related brands");
  }
  // 4- delete the related products
  const product = await Product.deleteMany({ subCategoryId });
  if (product.deletedCount <= 0) {
    console.log("There is no related prodcuts");
  }
  // 5- delete the subCategory folder from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`
  );
  // 6- send response
  res
    .status(200)
    .json({ success: true, message: "Category deleted successfully" });
};
