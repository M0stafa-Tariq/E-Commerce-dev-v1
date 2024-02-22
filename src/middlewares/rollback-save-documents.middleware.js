export const rollbackSavedDocuments = async (req, res, next) => {
  /**
   * @param {object} { model ,_id}  - the saved documents
   * @description delete the saved documents from the database if the request failed
   */
  if (req.savedDocument) {
    console.log("rollbackSavedDocument middleware");
    console.log(req.savedDocument);
    const { model, _id } = req.savedDocument;
    await model.findByIdAndDelete(_id);
  }
};
