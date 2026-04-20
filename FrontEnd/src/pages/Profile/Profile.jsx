import React, { useContext, useState, useEffect } from 'react'
import './Profile.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'

const Profile = () => {
    const { url, token, userData, getUserData } = useContext(StoreContext)
    const [image, setImage] = useState(false)
    const [name, setName] = useState("")

    useEffect(() => {
        if (userData) {
            setName(userData.name)
        }
    }, [userData])

    const updateProfile = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append("name", name)
        if (image) {
            formData.append("image", image)
        }

        const response = await axios.post(url + "api/user/updateprofile", formData, { headers: { token } })
        if (response.data.success) {
            alert(response.data.message)
            await getUserData(token)
            setImage(false)
        } else {
            alert("Error updating profile")
        }
    }

    if (!userData) return <div className='profile-loading'>Loading...</div>

    return (
        <div className='profile'>
            <div className="profile-container">
                <form onSubmit={updateProfile}>
                    <div className="profile-title">
                        <h2>My Profile</h2>
                        <p>Manage your account settings</p>
                    </div>
                    <div className="profile-img-upload">
                        <p>Profile Picture</p>
                        <label htmlFor="image">
                            <img src={image ? URL.createObjectURL(image) : (userData.image ? url + "profile-images/" + userData.image : assets.profile_icon)} alt="" />
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                        <span>Click to change photo</span>
                    </div>
                    <div className="profile-details">
                        <div className="profile-input-group">
                            <label>Full Name</label>
                            <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Your Name' required />
                        </div>
                        <div className="profile-input-group">
                            <label>Email Address</label>
                            <input value={userData.email} type="email" disabled />
                            <small>Email cannot be changed</small>
                        </div>
                    </div>
                    <button type='submit' className='profile-btn'>Save Changes</button>
                </form>
            </div>
        </div>
    )
}

export default Profile
