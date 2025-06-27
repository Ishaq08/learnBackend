import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {upLoadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // save in db
        return{accessToken, refreshToken}


    } catch (error) {
        throw new ApiError (500, "Some thing went wrong ehile grnerating tokens ")
    }
}
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

    console.log("req.files:", req.files); // Added logging for debugging

    //get user details
    const { fullname, email, username, password } = req.body
    //console.log("email", email);

    // validations 
    if (
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400, " All firld are required")
    }

    // check is user already exists: username , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email or username is already exists ")
    }
    console.log(req.files);

    // check fro images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path   // multer is file
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
        
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // check fro cloudinary images , check for avatar
    const avatar = await upLoadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath ? await upLoadOnCloudinary(coverImageLocalPath) : null;
    
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
    
    const createdUser = await User.findById(user._id).select(
       "-password -refreshToken"
    )
    
    if (!createdUser) {
        throw new ApiError(500, "Some thing went wrong while register user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body => data
    // username or email
    //find the user
    //password check    
    //access and refresh token
    //send in cookies
    
    const {email, username, password }= eq.body

    if (!username || !email) {
        throw new ApiError( 400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username, email}]
    })
    
    if (!user) {
     throw new ApiError( 400, "user doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        throw new ApiError( 400, "Invalid user credentials")
       }
    const {accessToken,  refreshToken } = await generateAccessAndRefreshToken|(user._id)

    const loggedInUser = await user.findById(user._id).
        select("-password -refreshToken") // optional
    
    const options = {
        httpOnly: true ,
        secure: true
    } // modify only through server

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser, accessToken, refreshToken

            },
                "User login Successfully"
            )
        )  
})

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
        req.user._id, {
            $set: {
                refreshToken: undefined
            }
   },
    {
     new: true // return new value
    }
    )

    const options = {
        httpOnly: true ,
        secure: true
    } 

    return res
    .status(200)
    .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
    .json(new ApiResponse( 200, {}, "User logged Out"))
})


export {
    regsiterUser,
    loginUser,
    logoutUser
}