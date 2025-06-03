import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'// from my server to user browser access cookies and set cookies , to perform CRUD operation

const app = new express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true     
}))

// Data comes as json from
app.use(express.json({
    limit: "16kb"
})) // for express old time it can't accept json like above ,they use body parser

// data from URL
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public")) //file , images are stord . its a public asets
app.use(cookieParser())

// routes

import userRouter from "./routes/user.routes.js"


// routes declearation
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register


export {app}
