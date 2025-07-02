import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    comment: {
        tpye: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video: {
        tpye: Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy: {
        tpye: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet: {
        tpye: Schema.Types.ObjectId,
        ref: "Tweet"
    }

},
    {timestamps: true}
)
export const Like = mongoose.model("Like", likeSchema)