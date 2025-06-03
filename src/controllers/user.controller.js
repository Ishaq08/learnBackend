import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {upupLoadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const regsiterUser = asyncHandler(async (req, res) => {
    // get user details from frontend (postman)--> user.model.js
    // validation - not empty
    // check is user already exists: username , email
    // check fro cloudinary images , check for avatar
    // upload them to  , avatar
    // create user object - create entry in db
    // remove password and refresh token field from reponse
    // check for user creation
    // return response

    //get user details
    const { fullname, email, username, password } = req.body
    console.log("email", email);

    // validations 
    if (
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400, " All firld are required")
    }

    // check is user already exists: username , email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email or username is already exists ")
    }

    // check fro images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path   // multer is file
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // check fro cloudinary images , check for avatar
    const avatar = await upupLoadOnCloudinary(avatarLocalPath)
    const coverImage = await upupLoadOnCloudinary(coverImageLocalPath)
    
    // upload them to  , avatar
    if (!avatar) {
        throw new ApiError (400, " Avatar file is required")
    }
    
    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await user.findbyId(user._id).select(
       "-password -refreshToken"
    )
    
    if (createdUser) {
        throw new ApiError(500, "Some thing went wrong while register user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register successfully")
    )

})


export {regsiterUser}