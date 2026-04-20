import React, { useContext, useEffect, useState } from 'react'
import "./MyOrders.css"
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import {assets} from "../../assets/assets"

const MyOrders = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [tab, setTab] = useState("active");

    const fetchOrders = async () => {
        const response = await axios.post(url + "api/order/userorders", {}, { headers: { token } })
        setData(response.data.data.reverse()) // Reverse to show latest first
    }

    const cancelOrder = async (orderId) => {
        const response = await axios.post(url + "api/order/cancel", { orderId }, { headers: { token } });
        if (response.data.success) {
            alert("Order Cancelled Successfully");
            fetchOrders();
        } else {
            alert(response.data.message);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders()
        }
    }, [token])

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => [...prev]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const getTimeLeft = (orderDate) => {
        const created = new Date(orderDate).getTime();
        const now = new Date().getTime();
        const diff = (created + 3 * 60 * 1000) - now;
        return diff > 0 ? Math.ceil(diff / 1000) : 0;
    }

    const filteredOrders = data.filter(order => {
        const timeLeft = getTimeLeft(order.date);
        const isActive = timeLeft > 0 || order.status === "Food Processing" || order.status === "Out for Delivery";
        return tab === "active" ? isActive : !isActive;
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const handlePaymentSelection = async (method) => {
        if (method === "online") {
            const response = await axios.post(url + "api/order/dinein-payment", { orderId: selectedOrderId }, { headers: { token } });
            if (response.data.success) {
                window.location.replace(response.data.session_url);
            }
        } else {
            const response = await axios.post(url + "api/order/dinein-cash", { orderId: selectedOrderId }, { headers: { token } });
            if (response.data.success) {
                alert("Cash Payment Requested. Please pay at the counter.");
                setShowPaymentModal(false);
                fetchOrders();
            }
        }
    }

    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const printBill = () => {
        window.print();
    }

    return (
        <div className='my-orders'>
            <div className="my-orders-header">
                <h2>My Orders</h2>
                <div className="order-tabs">
                    <button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>Active Orders</button>
                    <button className={tab === "past" ? "active" : ""} onClick={() => setTab("past")}>Past Orders</button>
                </div>
            </div>
            <div className="container">
                {filteredOrders.length > 0 ? filteredOrders.map((order, index) => {
                    const timeLeft = getTimeLeft(order.date);
                    return (
                        <div key={index} className="my-orders-order">
                            <img src={assets.parcel_icon} alt="" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " X " + item.quantity
                                } else {
                                    return item.name + " X " + item.quantity + " , "
                                }
                            })}</p>
                            <p>₹{order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span className={order.status === "Bill Sent" ? "status-alert" : ""}>&#x25cf;</span> <b>{order.status === "Bill Sent" ? "Bill Ready - Please Pay" : order.status}</b></p>
                            <div className="order-actions">
                                {order.status === "Bill Sent" ? (
                                    <>
                                        <button onClick={() => { setSelectedOrderId(order._id); setShowPaymentModal(true); }} className='pay-btn'>Pay Now / Settle</button>
                                        <button onClick={() => { setSelectedOrder(order); setShowBillModal(true); }} className='view-bill-btn'>View Detailed Bill</button>
                                    </>
                                ) : (
                                    <button onClick={fetchOrders}>Track Order</button>
                                )}
                                {timeLeft > 0 && order.status === "Food Processing" && (
                                    <button onClick={() => cancelOrder(order._id)} className='cancel-btn'>
                                        Cancel ({Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')})
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                }) : <p className='no-orders'>No {tab} orders found.</p>}
            </div>

            {showBillModal && selectedOrder && (
                <div className="bill-modal-overlay">
                    <div className="bill-modal user-bill">
                        <div className="bill-header">
                            <h2>YOUR INVOICE</h2>
                            <button className="close-btn" onClick={() => setShowBillModal(false)}>×</button>
                        </div>
                        <div id="printable-bill" className="bill-content">
                            <div className="restaurant-info">
                                <h1>FOOD ORDERING SYSTEM</h1>
                                <p>123 Street Name, City, Country</p>
                                <p>Phone: +91 9023965140</p>
                            </div>
                            <hr />
                            <div className="bill-meta">
                                <div>
                                    <p><b>Order ID:</b> {selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</p>
                                    <p><b>Date:</b> {new Date(selectedOrder.date).toLocaleDateString()} {new Date(selectedOrder.date).toLocaleTimeString()}</p>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <p><b>Type:</b> {selectedOrder.orderType}</p>
                                    {selectedOrder.orderType === "Dine-In" && <p><b>Table:</b> {selectedOrder.tableNumber}</p>}
                                </div>
                            </div>
                            <hr />
                            <table className="bill-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.price}</td>
                                            <td>₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <hr />
                            <div className="bill-total">
                                <div className="total-row grand-total">
                                    <span>GRAND TOTAL</span>
                                    <span>₹{selectedOrder.amount}</span>
                                </div>
                            </div>
                            <hr />
                            <p className="footer-msg">Thank you for dining with us!</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={printBill} className="print-btn">Download PDF / Print</button>
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <h3>Settle Your Bill</h3>
                        <p>How would you like to pay for Table Service?</p>
                        <div className="payment-options">
                            <button onClick={() => handlePaymentSelection("online")} className="online-pay">
                                <img src={assets.parcel_icon} alt="" />
                                <div>
                                    <b>Pay Online (Stripe)</b>
                                    <p>Fast & Secure Digital Payment</p>
                                </div>
                            </button>
                            <button onClick={() => handlePaymentSelection("cash")} className="cash-pay">
                                <img src={assets.bag_icon} alt="" />
                                <div>
                                    <b>Pay at Counter / Table</b>
                                    <p>Settle with Cash or Card at restaurant</p>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => setShowPaymentModal(false)} className="close-modal">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders
