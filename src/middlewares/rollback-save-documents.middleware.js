export const rollbackSavedDocuments = async (req, res, next) => {
  /**
   * @param {object} { model ,_id}  - the saved documents
   * @description delete the saved documents from the database if the request failed
   */
  if (req.savedDocuments) {
    console.log("rollbackSavedDocuments middleware");
    console.log(req.savedDocuments);
    const { model, _id } = req.savedDocuments;
    await model.findByIdAndDelete(_id);
  }
};
