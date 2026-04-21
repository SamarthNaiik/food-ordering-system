import React, { useState } from 'react'
import './Login.css'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const Login = ({ setToken, url }) => {
    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/user/login"
        } else {
            newUrl += "/api/user/register"
        }

        // Add role to data if signing up
        const payload = currState === "Login" ? data : { ...data, role: "admin" };

        try {
            const response = await axios.post(newUrl, payload);
            if (response.data.success) {
                if (response.data.role === "admin") {
                    setToken(response.data.token);
                    sessionStorage.setItem("token", response.data.token);
                    toast.success(currState === "Login" ? "Logged in successfully" : "Admin account created");
                } else {
                    toast.error("Access denied. Standard users cannot login here.");
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    }

    return (
        <div className='login-page'>
            <form onSubmit={onLogin} className="login-container">
                <div className="login-title">
                    <h1 className='login-logo-text'>Food Ordering</h1>
                    <h2>{currState === "Login" ? "Admin Login 🍔" : "Admin Sign Up 🍕"}</h2>
                </div>
                <div className="login-inputs">
                    {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button type='submit'>{currState === "Sign Up" ? "Create admin account" : "Login"}</button>
                <div className="login-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login"
                    ? <p>Create a new admin account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an admin account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default Login
