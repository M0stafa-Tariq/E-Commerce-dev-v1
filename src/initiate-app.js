import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-save-documents.middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middlewares.js";
import * as routers from "./modules/index.routes.js";
import { cronToChangeExpiredCoupons } from "./utils/crons.js";

export const initiateApp = async (app, express) => {
  const port = process.env.PORT;

  app.use(express.json());

  await db_connection();

  app.use("/auth", routers.authRouter);
  app.use("/user", routers.userRouter);
  app.use("/category", routers.categoryRouter);
  app.use("/subCategory", routers.subCategory);
  app.use("/brand", routers.brandRouter);
  app.use("/product", routers.productRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/coupon", routers.couponRouter);
  app.use("/order", routers.orderRouter);
  app.use("/review", routers.reviewRouter);

  app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Page not found!" });
  });

  app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments);
  // cronToChangeExpiredCoupons()

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
