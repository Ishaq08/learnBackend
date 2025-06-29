import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {upLoadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        //console.log(user);
        if (!user) {
            throw new ApiError ("user is not found")
        }
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // save in db
        return{accessToken, refreshToken}


    } catch (error) {
        console.error("Error in generateAccessAndRefreshToken:", error);
        throw new ApiError (500, "Some thing went wrong while generating tokens ")
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
    
    const { email, username, password } = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError( 400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username: username }, { email: email }]
    })
    
    if (!user) {
     throw new ApiError( 400, "user doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if (!isPasswordValid) {
        throw new ApiError( 400, "Invalid user credentials")
       }
    const {accessToken,  refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
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

const refreshAccessToken = asyncHandler(async (req, res) => {
   const inComingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if (!inComingRefreshToken) {
    throw new ApiError(401, "unauthrozied request")
    }

  try {
      const decodedToken = jwt.verify(
          inComingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
      const user = User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "invalid refresh token")
      }
      if (inComingRefreshToken !== user?.refreshToken) {
          throw new ApiError (401, "Refresh token is expried or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
  
  return res 
      .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
      .json(
          new ApiResponse(
              200,
              { accessToken, newRrefreshToken },
              "Access token refrehed"
      )
  )
  } catch (error) {
    throw new ApiError( 401, error?.message || "invalid refresh token")
  }
    
})

const ChangeCurrentPassword = asyncHandler(async (req, res) => {
    const {  oldPassword, newPassword} = req.body

    const user  = await User.findById(req.user?._id)
   const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid Password")
    }
    
    user.password = newPassword// user model
    await user.save({validateBeforeSave: false})
    return res.status(200).json(
        new ApiResponse (200, {},"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fatch successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are requied")
    }
   
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {new: true}//information after update
    
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated sccessfully"))
    
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await upLoadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar update Successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover Image is missing")
    }

    const coverImage = await upLoadOnCloudinary(coverImage)
    
    if (!coverImage.url) {
        throw new ApiError(400," Error while Uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200, user, "cover Image Update successfully"
        ))
})

export {
    regsiterUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage

}