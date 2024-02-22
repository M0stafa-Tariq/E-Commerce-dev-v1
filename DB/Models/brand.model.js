import mongoose, { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, //Admin
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, //Admin
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
);

brandSchema.virtual("products",{
  ref:"Product",
  localField:"_id",
  foreignField:"brandId"
})

export default mongoose.models.Brand || model("Brand", brandSchema);
