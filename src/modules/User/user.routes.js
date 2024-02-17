import { Router } from "express";
import asyncHandler from "express-async-handler";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";
import * as userController from "./user.controller.js"
const router = Router();

router.put("/",auth(endPointsRoles.UPDATE_USER),asyncHandler(userController.updateUser))
router.delete("/",auth(endPointsRoles.UPDATE_USER),asyncHandler(userController.deleteUser))
router.get("/",auth(endPointsRoles.UPDATE_USER),asyncHandler(userController.getUser))

export default router;
