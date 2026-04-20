import express from "express";
import authMiddleware from "../Middleware/auth.js";
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, cancelOrder, dineInPayment, dineInCash } from '../Controllers/OrderController.js';

const orderRouter=express.Router()

import adminAuth from "../Middleware/adminAuth.js";

orderRouter.post("/place",authMiddleware,placeOrder)
orderRouter.post("/verify",verifyOrder)
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.get("/list", adminAuth, listOrders)
orderRouter.post("/status", adminAuth, updateStatus)
orderRouter.post("/cancel", authMiddleware, cancelOrder)
orderRouter.post("/dinein-payment", authMiddleware, dineInPayment)
orderRouter.post("/dinein-cash", authMiddleware, dineInCash)

export default orderRouter