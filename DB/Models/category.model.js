import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true, unique: true },
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, //superAdmim
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, //superAdmin
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual populate for subCategories model
categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
});

export default model("Category", categorySchema);
