import mongoose, { Schema } from "mongoose";

const tweetSchmea = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    contant: {
        type: String,
        require: true
    }
},
    { timestamps: true }
) 

export const Tweet = mongoose.model("Tweet", tweetSchmea)