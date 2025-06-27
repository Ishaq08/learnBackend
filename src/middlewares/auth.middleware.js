import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// when res can not be use write _
export const verifyJwt = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    try {
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }// when token is not present
    
        //when token is present 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            // discuss about frontend
            throw new ApiError(401, "invalid Access Token")
        }
    
        req.user = user;
        next()
    
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
    
})
