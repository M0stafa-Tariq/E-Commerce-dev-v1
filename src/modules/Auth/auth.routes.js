
import { Router } from "express";
import * as authController from './auth.controller.js';
import expressAsyncHandler from "express-async-handler";
const router = Router();


router.post('/', expressAsyncHandler(authController.signUp))
router.get('/verify-email', expressAsyncHandler(authController.verifyEmail))


router.post('/login', expressAsyncHandler(authController.signIn))



export default router;