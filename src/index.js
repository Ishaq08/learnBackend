//require('dotenv').config({path: './env'})

import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import connectDB from './db/index.js';
import { app } from './app.js';

connectDB()
    .then((result) => {
    app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Sever is runing at Port: ${process.env.PORT}`);
    })
}).catch((err) => {
    console.log("mongo db connection falied !!!", err);
});












/* // first apporch
import express from 'express' // some time initalize app in index file
const app = new express()
 
(async() => {
    try {
         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error", error)
        throw error
    }
})()
*/