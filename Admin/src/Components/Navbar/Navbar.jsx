import React from 'react'
import "./Navbar.css"
import { assets } from '../../assets/assets'

const Navbar = ({setToken}) => {
  
  const logout = () => {
    sessionStorage.removeItem("token");
    setToken("");
  }

  return (
    <div className='navbar'>
      <h1 className='navbar-logo-text'>Food Ordering Admin</h1>
      <div className="navbar-right">
        <button onClick={logout} className='logout-btn'>Logout</button>
        <img className="profile" src={assets.profile_image} alt="" />
      </div>
    </div>
  )
}

export default Navbar
