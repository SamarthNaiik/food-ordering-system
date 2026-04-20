import userModel from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user
const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await userModel.findOne({email})

        if(!user) {
            return res.json({success:false,messgae:"User Doesn't Exist"})
        }

        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch) {
            return res.json({success:false,message:"Invalid Credentials!"})
        }
        const token=createToken(user._id, user.role)
        res.json({success:true,token,role:user.role})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const createToken=(id, role)=>{
    return jwt.sign({id, role},process.env.JWT_SECRET)
}

// register user
const registerUser=async(req,res)=>{
    const {name,password,email,role}=req.body;
    try {
        const exist=await userModel.findOne({email})
        // checking user already exists
        if(exist) {
            return res.json({success:false,message:"User Already Exist"})
        }
        // validating email format and strong format
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter Valid EMail"})
        }
        if(password.length<8) {
            return res.json({success:false,message:"Please Enter Strong Password"})
        }

        // Hashing User Password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            role: role || "user"
        })

        const user=await  newUser.save()
        const token=createToken(user._id, user.role)
        res.json({success:true,token,role:user.role})    
    } catch(error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// get user profile
const getProfile=async(req,res)=>{
    try {
        const user=await userModel.findById(req.body.userId)
        res.json({success:true,data:user})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error fetching profile"})
    }
}

// update user profile
const updateProfile=async(req,res)=>{
    try {
        const updateData = {
            name: req.body.name
        }
        if (req.file) {
            updateData.image = req.file.filename
        }
        
        await userModel.findByIdAndUpdate(req.body.userId, updateData)
        res.json({success:true,message:"Profile Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error updating profile"})
    }
}

export{loginUser,registerUser,getProfile,updateProfile}