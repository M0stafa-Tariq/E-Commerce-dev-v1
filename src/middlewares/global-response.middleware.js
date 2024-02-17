// Global response middleware
export const globalResponse = (err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(err["cause"] || 500).json({
      message: "Catch error",
      error_msg: err.message,
      location: err.stack,
    });
    next();
  }
};
