import { Router } from "express";
import { generateImage } from "../controllers/imageController.js";
import { userAuth } from "../middlewares/auth.js";

const router = Router()



router.route("/generate-image").post(userAuth,generateImage)


export default router