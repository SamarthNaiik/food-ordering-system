import React, { useState, useEffect } from 'react'
import "./Navbar.css"
import {Link, useNavigate, useLocation} from "react-router-dom"
import { assets } from "../../assets/assets"
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({setShowLogin}) => {
  const { getTotalCartAmount, token, setToken, search, setSearch, userData } = useContext(StoreContext)
  const navigate = useNavigate()
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(pathname === "/myorders" ? "my-orders" : "home");
  const [showSearch, setShowSearch] = useState(false);
  
  useEffect(() => {
    if (pathname === "/myorders") setMenu("my-orders");
    else if (pathname === "/") setMenu("home");
  }, [pathname]);

  const logout=()=>{
    localStorage.removeItem("token")
    setToken("")
    navigate("/")
  }
  return (
    <div className='navbar'>
      <Link to="/" className='navbar-logo-text'>Food Ordering System</Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
        <a href={pathname === "/" ? "#explore-menu" : "/#explore-menu"} onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
        <a href={pathname === "/" ? "#app-download" : "/#app-download"} onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile-app</a>
        <a href={pathname === "/" ? "#footer" : "/#footer"} onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>contact-us</a>
        {token && <Link to='/myorders' onClick={()=>setMenu("my-orders")} className={menu==="my-orders"?"active":""}>my-orders</Link>}
      </ul>
      <div className="navbar-right">
        <div className={`navbar-search-container ${showSearch ? 'active' : ''}`}>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img src={assets.search_icon} alt="" onClick={() => setShowSearch(!showSearch)} />
        </div>
        <div className="navbar-search-icon">
          <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
          <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
        {!token ? <button onClick={() => setShowLogin(true)}>SignIn</button>
          : <div className='navbar-profile'>
            <img src={userData && userData.image ? "http://localhost:4000/profile-images/" + userData.image : assets.profile_icon} alt='' />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/profile")}><img src={assets.profile_icon} alt='' /><p>Profile</p></li>
              <hr />
              <li onClick={() => navigate("/myorders")}><img src={assets.bag_icon} alt='' /><p>Orders</p></li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt=''/><p>Logout</p></li>
            </ul>
          </div>}
      </div>
    </div>
  )
}

export default Navbar