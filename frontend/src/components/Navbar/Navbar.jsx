import React, { useContext, useState } from "react"
import "./Navbar.css"
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { StoreContext } from "../../Context/StoreContext";

const Navbar = ({setShowLogin}) => {
  const [menu,setMenu] = useState("home");
  
  const {getTotalCartAmount, isAuthenticated, logout, user} = useContext(StoreContext);

  return (
    <div className="navbar">
      <Link to="/"><img src={assets.logo} alt="" className="logo"/></Link>
      <ul className="navbar_menu">
        <Link to="/" onClick ={()=>setMenu("home")}className={menu==="home"?"active": ""}>home</Link>
        <a href="#explore-menu"onClick ={()=>setMenu("menu")}className={menu === "menu"? "active":""}>menu</a>
        <a href="#app-download"onClick ={()=>setMenu("mobile-app")}className={menu === "mobile-app"?"active":""}>mobile-app</a>
        {isAuthenticated ? <Link to="/orders" onClick={() => setMenu("orders")} className={menu === "orders" ? "active" : ""}>my-orders</Link> : null}
        <a href="#footer"onClick ={()=>setMenu("contact-us")}className={menu === "contact-us"? "active": ""}>contact-us</a>
      </ul>
      <div className="navbar_right">
        <img src={assets.search_icon} alt=""/>
        <div className="navbar_search_icon">
          <Link to="/cart"><img src={assets.basket_icon} alt=""/></Link>
          <div className={getTotalCartAmount()===0? "":"dot"}></div>
        </div>
        {isAuthenticated ? (
          <div className="navbar_user">
            <div className="navbar_user_badge">
              <span>{user?.name?.[0] || "U"}</span>
            </div>
            <span className="navbar_user_name">{user?.name}</span>
            <Link to="/orders" className="navbar_orders_link">My Orders</Link>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={()=>setShowLogin(true)}>Sign in</button>
        )}
      </div>

    </div>
  )
}

export default Navbar
