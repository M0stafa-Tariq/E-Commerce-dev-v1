import slugify from "slugify";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";

//================================ add category ================================//

export const addCategory = async (req, res, next) => {
  // 1- destructing the request body
  const { name } = req.body;
  const { _id } = req.authUser;

  // 2- check if category name is already exists
  const isNameDuplicated = await Category.findOne({ name });
  if (isNameDuplicated)
    return next(new Error("Category name is already exists ", { casue: 409 }));

  // 3- genrate the slug
  const slug = slugify(name);

  // 4- upload image to cloudinary
  if (!req.file) return next(new Error("Image is required", { casue: 400 }));
  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`,
    });

    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`

  // 5- generate the category object
  const category = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
  };

  // 6- create category
  const createCategory = await Category.create(category);
  req.savedDocuments = { model: Category, _id: createCategory._id }
  if (!createCategory)
    return next(new Error("Category creation failed!", { casue: 400 }));

  // 7- send response
  res.status(201).json({
    succes: true,
    message: "Category created successfully!",
    data: { createCategory },
  });
};

//================================ upadte category ================================//
export const updateCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, oldPublicId } = req.body;
  // 2- destructuring the request params
  const { categoryId } = req.params;
  // 3- destructuring _id from the request authUser
  const { _id } = req.authUser;

  // 4- check if the category is exist by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return next({ cause: 404, message: "Category not found" });

  // 5- check if the use want to update the name field
  if (name) {
    // 5.1 check if the new category name different from the old name
    if (name == category.name) {
      return next({
        cause: 400,
        message: "Please enter different category name from the existing one.",
      });
    }

    // 5.2 check if the new category name is already exist
    const isNameDuplicated = await Category.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Category name is already exist" });
    }

    // 5.3 update the category name and the category slug
    category.name = name;
    category.slug = slugify(name, "-");
  }

  // 6- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    const newPulicId = oldPublicId.split(`${category.folderId}/`)[1];

    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
        public_id: newPulicId,
      }
    );

    category.Image.secure_url = secure_url;
  }

  // 7- set value for the updatedBy field
  category.updatedBy = _id;

  await category.save();

  // 8- send response
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

//============================== get all categories ==============================//
export const getAllCategories = async (req, res, next) => {
  const categories = await Category.find().populate([
    {
      path: "subCategories",
      populate: [{ path: "brands" }],
    },
  ]);

  if (!categories.length)
    return next(new Error("There are no categories!", { cause: 400 }));

  //send response
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
};

//============================== delete category ==============================//
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  // 1- delete category
  const catgory = await Category.findByIdAndDelete(categoryId);
  if (!catgory) return next({ cause: 404, message: "Category not found" });

  // 2-delete the related subcategories
  const subCategories = await SubCategory.deleteMany({ categoryId });
  if (subCategories.deletedCount <= 0) {
    console.log("There is no related subcategories");
  }

  //3- delete the related brands
  const brands = await Brand.deleteMany({ categoryId });
  if (brands.deletedCount <= 0) {
    console.log("There is no related brands");
  }

  // 4- delete the category folder from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`
  );

  res.status(200).json({ success: true, message: "Category deleted successfully" });
};
