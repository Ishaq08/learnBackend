import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, regsiterUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    regsiterUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt, logoutUser)// verifyjwt is middleware , which can complete his work and move to next

router.route("/refresh-token").post(refreshAccessToken)

export default router
