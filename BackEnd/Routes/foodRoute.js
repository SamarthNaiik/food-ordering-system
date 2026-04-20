import express from "express"
import { addFood, listFood, removeFood } from "../Controllers/FoodController.js"
import multer from "multer"

const foodRouter=express.Router()

// image storage engine
const storage=multer.diskStorage({
    destination : "Uploads",
    filename : (req,file,callback)=>{
        return callback(null,`${Date.now()}${file.originalname}`)
    }
})

const upload=multer({storage:storage})

import adminAuth from "../Middleware/adminAuth.js"

foodRouter.post("/add", adminAuth, upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", adminAuth, removeFood)

export default foodRouter