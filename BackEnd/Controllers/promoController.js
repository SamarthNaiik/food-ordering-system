import promoModel from "../Models/PromoModel.js";

// Validate Promo Code
const validatePromo = async (req, res) => {
    try {
        const { promoCode, cartAmount } = req.body;
        
        if (!promoCode) {
            return res.json({ success: false, message: "Please provide a promo code" });
        }

        const promo = await promoModel.findOne({ code: promoCode.toUpperCase(), isActive: true });
        
        if (!promo) {
            return res.json({ success: false, message: "Invalid or expired promo code" });
        }

        if (cartAmount < promo.minOrderAmount) {
            return res.json({ success: false, message: `Minimum order amount for this promo is ₹${promo.minOrderAmount}` });
        }

        let discount = 0;
        if (promo.discountType === "percentage") {
            discount = (cartAmount * promo.discountValue) / 100;
            if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
                discount = promo.maxDiscountAmount;
            }
        } else if (promo.discountType === "flat") {
            discount = promo.discountValue;
        }

        // Prevent discount from exceeding cart amount
        if (discount > cartAmount) {
            discount = cartAmount;
        }

        res.json({ success: true, discountAmount: discount, promoCode: promo.code });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error validating promo code" });
    }
}

// List active promo codes
const listPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({ isActive: true });
        res.json({ success: true, data: promos });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching promo codes" });
    }
}

export { validatePromo, listPromos }
