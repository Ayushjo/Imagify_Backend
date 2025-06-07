import { Router } from "express";
import { loginUser, paymentRazorpay, registerUser, userCredits, verifyRazorpay } from "../controllers/userController.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/credits").post(userAuth,userCredits)

router.route("/pay-razor").post(userAuth,paymentRazorpay)

router.route("/verify-razor").post(verifyRazorpay)
export default router