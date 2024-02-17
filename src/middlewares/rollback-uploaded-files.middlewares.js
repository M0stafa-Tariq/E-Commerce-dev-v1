import cloudinaryConnection from "../utils/cloudinary.js";

export const rollbackUploadedFiles = async (req, res, next) => {
  /**
   * @param {string} folderPath - the folder path of the images
   * @description delete images from cloudinary if the request failed
   */
  if (req.folder) {
      console.log("rollbackUploadedFiles middleware");
      console.log(req.folder);
    await cloudinaryConnection().api.delete_resources_by_prefix(req.folder);
    await cloudinaryConnection().api.delete_folder(req.folder);
  }
  next();
};
