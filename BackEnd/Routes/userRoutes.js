import express from "express"
import { loginUser,registerUser,getProfile,updateProfile } from "../Controllers/UserController.js"
import authMiddleware from "../Middleware/auth.js"
import multer from "multer"

const userRouter=express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads/profile",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.post("/getprofile",authMiddleware,getProfile)
userRouter.post("/updateprofile",authMiddleware,upload.single('image'),updateProfile)

export default userRouter;