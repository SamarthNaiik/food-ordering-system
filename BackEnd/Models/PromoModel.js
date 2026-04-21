import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true }, // e.g., 10 for 10%, or 50 for ₹50 flat
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null }, // for percentage caps
    isActive: { type: Boolean, default: true }
})

const promoModel = mongoose.models.promo || mongoose.model("promo", promoSchema);
export default promoModel;
