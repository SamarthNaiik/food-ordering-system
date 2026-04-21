import foodModel from "../Models/FoodModel.js";
import fs from 'fs';

// add food item
const addFood=async(req,res)=>{
    let image_filename=`${req.file.filename}`

    const food=new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try{
        await food.save()
        res.json({success:true, message:"Food Added"})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

// all food list
const listFood=async(req,res)=>{
    try{
        const foods=await foodModel.find({})
        res.json({success:true, data:foods})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

// remove food item
const removeFood=async(req,res)=>{
    try{    
        const food=await foodModel.findById(req.body.id)
        fs.unlink(`Uploads/${food.image}`,()=>{})

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message:"Food Removed"})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:"Error"})
    }
}

// edit food item
const editFood = async (req, res) => {
    try {
        const { id, name, description, price, category } = req.body;
        const food = await foodModel.findById(id);

        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Update fields
        food.name = name || food.name;
        food.description = description || food.description;
        food.price = price || food.price;
        food.category = category || food.category;

        // If a new image is uploaded, handle replacement
        if (req.file) {
            // Delete old image
            fs.unlink(`Uploads/${food.image}`, () => {});
            // Set new image
            food.image = req.file.filename;
        }

        await food.save();
        res.json({ success: true, message: "Food Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating food" });
    }
}

export { addFood, listFood, removeFood, editFood }