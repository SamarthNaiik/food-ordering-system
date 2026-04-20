import express from "express"
import cors from "cors"
import { connect } from "mongoose"
import { connectDB } from "./Config/DB.js   "
import foodRouter from "./Routes/foodRoute.js"
import userRouter from "./Routes/userRoutes.js"
import "dotenv/config"
import cartRouter from "./Routes/cartRoute.js"
import orderRouter from "./Routes/orderRoute.js"
import startOrderCron from "./Cron/orderCron.js"

// app config
const app=express()
const port=4000 

// Start Cron Job
startOrderCron();

// middleware
app.use(express.json())
app.use(cors())

// DB connection
connectDB();

// API endpoint
app.use("/api/food",foodRouter)
app.use("/images",express.static('Uploads'))
app.use("/profile-images",express.static('uploads/profile'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
