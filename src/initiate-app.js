import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-save-documents.middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middlewares.js";
import * as routers from "./modules/index.routes.js";

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

  app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments);

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
