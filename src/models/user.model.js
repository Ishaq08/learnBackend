import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required : true
        },
        coverimage: {
            type: String
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            typr: String,
        }

    }, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("passwaord")) return next();

        this.password = bcrypt.hash(this.password, 10)
        next()
})

userSchema.methods.isPasswaordCorrect = async function (passwaord) {
    return await bcrypt.compare(passwaord, this.passwaord)  
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECERT,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRYb
        }
    )
}
export const User = mongoose.model("User", userSchema)