import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./Config/DB.js";
import promoModel from "./Models/PromoModel.js";

const seedPromos = async () => {
    try {
        await connectDB();
        
        const promos = [
            { code: "SAVE10", discountType: "percentage", discountValue: 10, minOrderAmount: 1000, maxDiscountAmount: 80, isActive: true },
            { code: "WELCOME50", discountType: "flat", discountValue: 50, minOrderAmount: 200, maxDiscountAmount: null, isActive: true },
            { code: "FESTIVE20", discountType: "percentage", discountValue: 20, minOrderAmount: 1500, maxDiscountAmount: 200, isActive: true },
            { code: "LUNCH100", discountType: "flat", discountValue: 100, minOrderAmount: 800, maxDiscountAmount: null, isActive: true },
            { code: "MINI10", discountType: "percentage", discountValue: 10, minOrderAmount: 300, maxDiscountAmount: 30, isActive: true }
        ];

        for (let promo of promos) {
            await promoModel.findOneAndUpdate({ code: promo.code }, promo, { upsert: true, new: true });
        }

        console.log("Promo codes seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding promo codes:", error);
        process.exit(1);
    }
};

seedPromos();
