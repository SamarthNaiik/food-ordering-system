import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Sidebar from './Components/Sidebar/Sidebar'
import { Routes, Route } from "react-router-dom"
import Add from './Pages/Add/Add'
import List from './Pages/List/List'
import Orders from './Pages/Orders/Orders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Pages/Login/Login'
import { useState, useEffect } from 'react'

const App = () => {

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, [])

  return (
    <div>
      <ToastContainer />
      {!token ? <Login setToken={setToken} url={url} /> :
        <>
          <Navbar setToken={setToken}/>
          <hr />
          <div className="app-content">
            <Sidebar />
          <div className="main-view">
            <Routes>
              <Route path="/add" element={<Add url={url} token={token}/>} />
              <Route path="/list" element={<List url={url} token={token}/>} />
              <Route path="/orders" element={<Orders url={url} token={token}/>} />
            </Routes>
          </div>
          </div>
        </>
      }
    </div>
  )
}

export default App
