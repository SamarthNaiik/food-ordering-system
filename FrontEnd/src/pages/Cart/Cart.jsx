import React, { useContext } from 'react'
import { useNavigate } from "react-router-dom"
import "./Cart.css"
import "./Cart.css"
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const Cart = () => {

  const {cartItems, food_list, removeFromCart, getTotalCartAmount, url, token, promoCode, setPromoCode, promoDiscount, setPromoDiscount} = useContext(StoreContext)
  const [promoInput, setPromoInput] = React.useState("");
  const [availablePromos, setAvailablePromos] = React.useState([]);

  React.useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await axios.get(url + "api/promo/list");
        if (response.data.success) {
          setAvailablePromos(response.data.data);
        }
      } catch (error) {
        console.log("Error fetching promos");
      }
    };
    fetchPromos();
  }, [url]);

  const applyPromo = async (codeToApply) => {
    const code = codeToApply || promoInput;
    if (!code) {
      alert("Please enter a promo code");
      return;
    }
    if (!token) {
      alert("Please login to apply promo codes");
      return;
    }
    try {
      const response = await axios.post(url + "api/promo/validate", {
        promoCode: code,
        cartAmount: getTotalCartAmount()
      }, { headers: { token } });
      
      if (response.data.success) {
        setPromoDiscount(response.data.discountAmount);
        setPromoCode(response.data.promoCode);
        alert(`Promo applied! You saved ₹${response.data.discountAmount}`);
      } else {
        alert(response.data.message);
        setPromoDiscount(0);
        setPromoCode("");
      }
    } catch (error) {
      console.log(error);
      alert("Error applying promo code");
    }
  }
  const navigate=useNavigate()

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item,index)=>{
          if(cartItems[item._id]>0)
          {
            return (
              <div>
                <div className="cart-items-title cart-items-item">
                  <img src={url+"images/"+item.image} alt="" />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>₹{item.price*cartItems[item._id]}</p>
                  <p onClick={()=>{removeFromCart(item._id)}} className='cross'>x</p>
                </div>
                <hr />
              </div>
              
            )
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Calculated at checkout</p>
            </div>
            {promoDiscount > 0 && (
                <>
                <hr />
                <div className="cart-total-details">
                  <p>Promo Discount ({promoCode})</p>
                  <p className="discount-text">-₹{promoDiscount}</p>
                </div>
                </>
            )}
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{Math.max(0, getTotalCartAmount() - promoDiscount)}</b>
            </div>
          </div>
          <button onClick={()=>navigate('/placeorder')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code. Enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='Promo Code' value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
              <button onClick={() => applyPromo(promoInput)}>Submit</button>
            </div>
            {availablePromos.length > 0 && (
              <div className="available-promos">
                <p>Available Offers:</p>
                <div className="promo-list">
                  {availablePromos.map((promo) => {
                    const isApplicable = getTotalCartAmount() >= promo.minOrderAmount;
                    return (
                      <div className={`promo-card ${!isApplicable ? 'disabled' : ''}`} key={promo._id} onClick={() => {
                        if(isApplicable) {
                            setPromoInput(promo.code);
                            applyPromo(promo.code);
                        }
                      }}>
                        <b>{promo.code}</b>
                        <span>
                          {promo.discountType === 'percentage' 
                            ? `${promo.discountValue}% OFF (Up to ₹${promo.maxDiscountAmount})`
                            : `Flat ₹${promo.discountValue} OFF`}
                        </span>
                        <small>Min Order: ₹{promo.minOrderAmount}</small>
                        {!isApplicable && <small className="promo-warning">Add ₹{promo.minOrderAmount - getTotalCartAmount()} more to apply</small>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
