import cron from 'node-cron';
import orderModel from '../Models/OrderModel.js';

const startOrderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Running Order Status Cron Job...');
        try {
            const currentTime = new Date();
            const orders = await orderModel.find({ 
                status: { $in: ["Food Processing", "Preparing"] },
                payment: true // Only process paid orders
            });

            for (const order of orders) {
                const orderTime = new Date(order.date);
                const diffInMinutes = (currentTime - orderTime) / 1000 / 60;

                // After 3 minutes, if still Food Processing, move to Preparing (optional but good for UI)
                // This effectively 'closes' the cancel window visually if we want
                if (diffInMinutes >= 3 && order.status === "Food Processing") {
                    // Note: We don't necessarily NEED to change status here since the cancel logic 
                    // is time-based, but it provides good feedback.
                    // If you want to keep the current statuses, we can skip this or use "Preparing"
                }

                // After 10 minutes, change to Out for Delivery
                if (diffInMinutes >= 10 && order.status === "Food Processing") {
                    await orderModel.findByIdAndUpdate(order._id, { status: "Out for Delivery" });
                    console.log(`Order ${order._id} status updated to Out for Delivery automatically.`);
                }
            }
        } catch (error) {
            console.error('Error in Order Cron Job:', error);
        }
    });
};

export default startOrderCron;
