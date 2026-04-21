import { createContext, useEffect, useState } from "react";
import axios from "axios"

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems,setCartItems]=useState({});
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000/"

    const [token,setToken]=useState("")
    const [food_list,setFoodList]=useState([])
    const [search,setSearch]=useState("")
    const [userData,setUserData]=useState(null)
    const [promoCode, setPromoCode] = useState("")
    const [promoDiscount, setPromoDiscount] = useState(0)

    const getUserData = async (token) => {
        const response = await axios.post(url + "api/user/getprofile", {}, { headers: { token } })
        if (response.data.success) {
            setUserData(response.data.data)
        }
    }

    const addToCart=async(itemId)=>{
        if(!cartItems[itemId]) {
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }
        else {
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
        if(token) {
            await axios.post(url+"api/cart/add",{itemId},{headers:{token}})
        }
    }

    const removeFromCart=async(itemId)=>{
    setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
    if(token) {
        await axios.post(url+"api/cart/remove",{itemId},{headers:{token}})
    }
    }

    const getTotalCartAmount=()=>{
        let totalAmount=0
        for(const item in cartItems)
        {
            if(cartItems[item]>0)
            {
                let itemInfo=food_list.find((product)=>product._id===item)
                totalAmount+=itemInfo.price*cartItems[item]
            }
        }
        return totalAmount;
    }

    const fetchFoodList=async()=>{
        const response=await axios.get(url+"api/food/list")
        setFoodList(response.data.data)
    }

    // const loadCartData=async()=>{
    //     const response=await axios.post(url+"api/cart/get",{},{headers:{token}})
    //     setCartItems(response.data.cartData)
    // }

    useEffect(()=>{
        async function loadData() {
            await fetchFoodList()
            if(sessionStorage.getItem("token")) {
                setToken(sessionStorage.getItem("token"))
                await getUserData(sessionStorage.getItem("token"))
            }
        }
        loadData()
    },[])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        search,
        setSearch,
        userData,
        setUserData,
        getUserData,
        promoCode,
        setPromoCode,
        promoDiscount,
        setPromoDiscount
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;