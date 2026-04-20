import React from 'react'
import "./Orders.css"
import axios from "axios"
import { useState } from 'react'
import {toast} from 'react-toastify'
import { useEffect } from 'react'
import {assets} from "../../assets/assets"

const Orders = ({ url, token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    const response = await axios.get(url + "/api/order/list", { headers: { token } })
    if (response.data.success) {
      setOrders(response.data.data)
      console.log(response.data.data);
    } else {
      toast.error("Error")
    }
  }

  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/order/status", {
      orderId,
      status: event.target.value
    }, { headers: { token } })
    if (response.data.success) {
      await fetchAllOrders()
    }
  }

  useEffect(() => {
    fetchAllOrders();
    // Auto-refresh every 10 seconds to catch cancellations
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [])

  const getTimeLeft = (orderDate) => {
    const created = new Date(orderDate).getTime();
    const now = new Date().getTime();
    const diff = (created + 3 * 60 * 1000) - now;
    return diff > 0 ? Math.ceil(diff / 1000) : 0;
  }

  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const printBill = () => {
    window.print();
  }

  const [activeTab, setActiveTab] = useState("Delivery");

  const filteredOrders = orders.filter(order => 
    order.orderType === activeTab && 
    order.status !== "Delivered" && 
    order.status !== "Completed"
  );

  return (
    <div className='order add'>
      <div className="orders-header">
        <h3>Order Management</h3>
        <div className="tab-container">
          <button className={activeTab === "Delivery" ? "active" : ""} onClick={() => setActiveTab("Delivery")}>Delivery Orders</button>
          <button className={activeTab === "Dine-In" ? "active" : ""} onClick={() => setActiveTab("Dine-In")}>Dine-In / Table Orders</button>
        </div>
      </div>
      <div className='order-list'>
        {filteredOrders.length === 0 ? <p className='no-orders'>No {activeTab} orders at the moment.</p> : 
        filteredOrders.map((order, index) => {
          const timeLeft = getTimeLeft(order.date);
          return (
            <div key={index} className={`order-item ${order.orderType === "Dine-In" ? "dine-in-order" : ""}`}>
              <img src={assets.parcel_icon} alt="" />
              <div>
                <div className="order-item-header">
                  {order.orderType === "Dine-In" ? (
                    <span className="order-type-badge dine-in">🏠 TABLE: {order.tableNumber}</span>
                  ) : (
                    <span className="order-type-badge delivery">🚚 DELIVERY</span>
                  )}
                  {timeLeft > 0 && order.status === "Food Processing" && (
                    <span className="cancellation-badge">
                      ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <p className='order-item-food'>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " X " + item.quantity
                    } else {
                      return item.name + " X " + item.quantity + " , "
                    }
                  })}
                </p>
                <p className="order-item-name">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                {order.orderType === "Delivery" && (
                  <div className="order-item-address">
                    <p>{order.address.street + " , "}</p>
                    <p>{order.address.city + " , " + order.address.state + " , " + order.address.country + " , " + order.address.zipcode}</p>
                  </div>
                )}
                <p className='order-item-phone'>{order.address.phone}</p>
              </div>
              <p>Items: {order.items.length}</p>
              <p>Amount: ₹{order.amount}</p>
              <div className="order-item-actions">
                {order.orderType === "Delivery" ? (
                  <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                ) : (
                  <div className="dine-in-actions">
                    {order.status === "Bill Sent" || order.status === "Cash Payment Requested" ? (
                      <button className='settle-btn' style={{backgroundColor: '#000'}} onClick={() => statusHandler({target: {value: "Completed"}}, order._id)}>Settle & Close Table</button>
                    ) : (
                      <button className='settle-btn' onClick={() => statusHandler({target: {value: "Bill Sent"}}, order._id)}>Send Bill to User</button>
                    )}
                  </div>
                )}
                <button className='bill-btn' onClick={() => { setSelectedOrder(order); setShowBillModal(true); }}>View Bill</button>
              </div>
            </div>
          )
        })}
      </div>

      {showBillModal && selectedOrder && (
        <div className="bill-modal-overlay">
          <div className="bill-modal">
            <div className="bill-header">
              <h2>INVOICE</h2>
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
              <div className="bill-customer">
                <p><b>Customer:</b> {selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                <p><b>Phone:</b> {selectedOrder.address.phone}</p>
              </div>
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
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.amount - (selectedOrder.orderType === "Delivery" ? 2 : 0)}</span>
                </div>
                {selectedOrder.orderType === "Delivery" && (
                  <div className="total-row">
                    <span>Delivery Fee</span>
                    <span>₹2</span>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>GRAND TOTAL</span>
                  <span>₹{selectedOrder.amount}</span>
                </div>
              </div>
              <hr />
              <p className="footer-msg">Thank you for your visit!</p>
            </div>
            <div className="modal-actions">
              <button onClick={printBill} className="print-btn">Print Bill / Save PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders

