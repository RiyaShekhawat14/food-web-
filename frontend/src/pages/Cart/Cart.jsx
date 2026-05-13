import React, { useContext } from "react"
import "./Cart.css"
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const {cartItems,food_list,removeFromCart,getTotalCartAmount,getDeliveryFee,isAuthenticated}=useContext(StoreContext)
  const navigate=useNavigate();
  return (
    <div className="cart">
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
        <hr/>
        {food_list.map((item)=>{
          if(cartItems[item._id]>0)
          {
            return(
              
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                <img src={item.image} alt=""/>
                <p>{item.name}</p>
                <p>${item.price}</p>
                <p>{cartItems[item._id]}</p>
                <p>${item.price*cartItems[item._id]}</p>
                <p onClick ={()=>removeFromCart(item._id)}className="cross">x</p>
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
        
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>

            </div>
            <hr/>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getDeliveryFee()}</p>

            </div>
            <hr/>
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount()===0 ? 0 : getTotalCartAmount()+getDeliveryFee()}</b>

            </div>
            <button onClick={()=>navigate("/order")}>
              {isAuthenticated ? "PROCEED TO CHECKOUT" : "SIGN IN TO CHECKOUT"}
            </button>
          </div>
          <div className="cart-promocode">
            <div>
              <p>If you have a promo code, Enter it here </p>
              <div className="cart-promocode-input">
                <input type="text" placeholder="Promo code"/>
                <button>Submit</button>
              </div>
            
            </div>
          </div>

        </div>
      </div>

    
  )
}

export default Cart
