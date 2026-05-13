import React, { useContext } from 'react'
import "./FoodItem.css"
import { assets } from '../../assets/assets'

import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({id,name,price,description,image}) => {
   
   
  const {cartItems,addToCart,removeFromCart}=useContext(StoreContext);
  return (
    <div className="food-items">
      <div className="food-item-image-container">
        <img className="food-item-image" src={image} alt=""/>
        {!cartItems[id]
              ?<button type="button" className="add-button" onClick={()=>addToCart(id)}><img className="add" src={assets.add_icon_white} alt="" /></button>
              :<div className="food-item-counter"> 
                  <button type="button" className="counter-btn" onClick={()=>removeFromCart(id)}><img src={assets.remove_icon_red} alt="" /></button>
                  <p>{cartItems[id]}</p>
                  <button type="button" className="counter-btn" onClick={()=>addToCart(id)}><img src={assets.add_icon_green} alt=""/></button>

              </div>


        }
      </div>
      <div className="food-item-info">
         <div className="food-item-name-rating">
             <p>{name}</p>
             <img src={assets.rating_starts} alt=""/>

         </div>
         <p className="food-item-description">{description}</p>
         <p className="food-item-price">${price}</p>
      </div>

    </div>
  )
}

export default FoodItem

