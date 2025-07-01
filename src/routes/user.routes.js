import { Router } from "express";
import { ChangeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, regsiterUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
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
router.route("/change-password").post(verifyJwt, ChangeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJwt, upload.single("/coverImage"), updateUserCoverImage)
router.route("/c/c:username").get(verifyJwt, getUserChannelProfile)
router.route("/history").get(verifyJwt, getWatchHistory)


export default router
