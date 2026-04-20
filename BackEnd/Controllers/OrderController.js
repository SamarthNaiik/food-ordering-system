import orderModel from "../Models/OrderModel.js";
import userModel from "../Models/UserModel.js";
import Stripe from "stripe";

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)

//Placing User Order from Frontend
const placeOrder=async(req,res)=>{

    const frontend_url="http://localhost:5175"

    try {
        if (req.body.orderType === "Dine-In") {
            // Check if there's an existing active (unpaid) order for this table and user
            const existingOrder = await orderModel.findOne({
                userId: req.body.userId,
                tableNumber: req.body.tableNumber,
                orderType: "Dine-In",
                payment: false,
                status: "Food Processing"
            });

            if (existingOrder) {
                // Merge items
                const updatedItems = [...existingOrder.items];
                req.body.items.forEach(newItem => {
                    const itemIndex = updatedItems.findIndex(item => item._id === newItem._id);
                    if (itemIndex > -1) {
                        updatedItems[itemIndex].quantity += newItem.quantity;
                    } else {
                        updatedItems.push(newItem);
                    }
                });

                await orderModel.findByIdAndUpdate(existingOrder._id, {
                    items: updatedItems,
                    amount: existingOrder.amount + req.body.amount
                });

                await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
                
                // If they want to pay online for the merged items, we still need to handle that, 
                // but for now, let's keep it simple: merge and then handle payment choice.
                if (req.body.paymentMethod === "cash") {
                    return res.json({ success: true, message: "Order updated on table", orderId: existingOrder._id });
                }
                // If online, we continue to create a Stripe session for the NEW items added or total? 
                // Stripe usually needs a session for the current transaction.
            }
        }

        const newOrder=new orderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address,
            orderType:req.body.orderType || "Delivery",
            tableNumber:req.body.tableNumber || ""
        })
        await newOrder.save()
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})

        if (req.body.orderType === "Dine-In" && req.body.paymentMethod === "cash") {
            return res.json({success:true, message: "Order placed on table", orderId: newOrder._id})
        }

        const line_items=req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100
            },
            quantity:item.quantity
        }))
        
        if (req.body.orderType === "Delivery") {
            line_items.push({
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:"Delivery Charges"
                    },
                    unit_amount:2*100
                },
                quantity:1
            })
        }

        const session=await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:"payment",
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
        res.json({success:true,session_url:session.url})
    } catch(error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const verifyOrder=async(req,res)=>{
    const {orderId,success}=req.body
    try {
        if(success=="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true})
            res.json({success:true,message:"Paid"})
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:true,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const userOrders=async(req,res)=>{
    try {
        const orders=await orderModel.find({
            userId:req.body.userId, 
            $or: [{payment: true}, {orderType: "Dine-In"}]
        })
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//Listing Orders for Admin Panel
const listOrders=async(req,res)=>{
    try {
        const orders=await orderModel.find({})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//API for Updating Order Status
const updateStatus=async(req,res)=>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//API for Cancelling Order (3 min window)
const cancelOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        
        // Check if order exists and belongs to the user
        if (!order || order.userId !== req.body.userId) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Check if 3 minutes have passed
        const currentTime = new Date();
        const orderTime = new Date(order.date);
        const timeDiff = (currentTime - orderTime) / 1000 / 60; // in minutes

        if (timeDiff > 3) {
            return res.json({ success: false, message: "Cancellation window closed (3 mins passed)" });
        }

        if (order.status !== "Food Processing") {
            return res.json({ success: false, message: "Order is already being prepared/delivered" });
        }

        await orderModel.findByIdAndDelete(req.body.orderId);
        res.json({ success: true, message: "Order Cancelled Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Dine-In Online Payment
const dineInPayment = async (req, res) => {
    const { orderId } = req.body;
    const frontend_url = "http://localhost:5175";
    try {
        const order = await orderModel.findById(orderId);
        const line_items = order.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: { name: item.name },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${order._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${order._id}`,
        });
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Dine-In Cash Payment Request
const dineInCash = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: "Cash Payment Requested" });
        res.json({ success: true, message: "Cash Payment Requested" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, cancelOrder, dineInPayment, dineInCash }