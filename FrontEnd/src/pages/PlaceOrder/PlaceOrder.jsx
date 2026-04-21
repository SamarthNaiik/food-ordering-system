import React, { useContext, useEffect, useState } from 'react'
import "./PlaceOrder.css"
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from "react-router-dom"

const PlaceOrder = () => {
  const {getTotalCartAmount,token,food_list,cartItems,setCartItems,url,promoCode,promoDiscount}=useContext(StoreContext)

  const [data,setData]=useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""
  })

  const onChangeHandler=(event)=>{
    const name=event.target.name;
    const value=event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const [orderType, setOrderType] = useState("Delivery");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const placeOrder=async(event, paymentMethod = "online")=>{
    if (event) event.preventDefault();
    setLoading(true);
    let orderItems=[]
    food_list.map((item)=>{
      if(cartItems[item._id]>0) {
        let itemInfo={...item} 
        itemInfo["quantity"]=cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })
    let finalAmount = Math.max(0, getTotalCartAmount() + (orderType === "Delivery" ? 2 : 0) - promoDiscount);
    let orderData={
      address: orderType === "Delivery" ? data : { firstName: "Dine-In", lastName: `Table ${tableNumber}`, phone: data.phone || "0000000000" },
      items:orderItems,
      amount: finalAmount,
      orderType: orderType,
      tableNumber: tableNumber,
      paymentMethod: paymentMethod,
      promoCode: promoCode,
      discountAmount: promoDiscount
    }
    try {
      let response=await axios.post(url+"api/order/place",orderData,{headers:{token}})
      if (response.data.success) {
        const {session_url}=response.data
        if (session_url) {
            window.location.replace(session_url)
        } else {
            setCartItems({})
            navigate("/myorders")
        }
      }
      else {
        alert("Error")
        setLoading(false);
      }
    } catch (error) {
      alert("Error placing order");
      setLoading(false);
    }
  }

  const navigate=useNavigate()

  useEffect(()=>{
    if (!token) {
      navigate("/cart")
    } else if(getTotalCartAmount()===0) {
      navigate("/cart")
    }
  },[token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <div className="order-type-selector">
          <button type='button' className={orderType === "Delivery" ? "active" : ""} onClick={() => setOrderType("Delivery")}>Home Delivery</button>
          <button type='button' className={orderType === "Dine-In" ? "active" : ""} onClick={() => setOrderType("Dine-In")}>Dine-In (Table Service)</button>
        </div>

        {orderType === "Delivery" ? (
          <>
            <p className="title">Delivery Information</p>
            <div className="multi-fields">
              <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
              <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
            </div>
            <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email Address' />
            <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
            <div className="multi-fields">
              <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
              <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
            </div>
            <div className="multi-fields">
              <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code' />
              <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
            </div>
            <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
          </>
        ) : (
          <>
            <p className="title">Dine-In Details</p>
            <div className="profile-input-group">
                <label>Table Number</label>
                <input required onChange={(e) => setTableNumber(e.target.value)} value={tableNumber} type="number" placeholder='Enter Table Number (e.g. 5)' />
            </div>
            <div className="profile-input-group">
                <label>Contact Number (Optional)</label>
                <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone Number' />
            </div>
            <p className='dine-in-notice'>Your order will be served directly to your table.</p>
          </>
        )}
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
          <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            {orderType === "Delivery" && (
                <>
                    <div className="cart-total-details">
                        <p>Delivery Fee</p>
                        <p>₹{getTotalCartAmount()===0?0:2}</p>
                    </div>
                    <hr />
                </>
            )}
            {promoDiscount > 0 && (
                <>
                <div className="cart-total-details">
                  <p>Promo Discount ({promoCode})</p>
                  <p className="discount-text">-₹{promoDiscount}</p>
                </div>
                <hr />
                </>
            )}
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount()===0?0:Math.max(0, getTotalCartAmount() + (orderType === "Delivery" ? 2 : 0) - promoDiscount)}</b>
            </div>
          </div>
          {orderType === "Delivery" ? (
            <button type='submit' disabled={loading}>{loading ? "PROCESSING..." : "PROCEED TO PAYMENT"}</button>
          ) : (
            <div className="dine-in-payment-options">
                <button type='button' onClick={() => placeOrder(null, "online")} className='pay-online-btn' disabled={loading}>
                    {loading ? "PROCESSING..." : "PAY ONLINE NOW"}
                </button>
                <button type='button' onClick={() => placeOrder(null, "cash")} className='pay-at-table-btn' disabled={loading}>
                    {loading ? "PROCESSING..." : "PAY AT TABLE (CASH/CARD)"}
                </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
