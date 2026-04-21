import React, { useEffect, useState } from 'react'
import "./List.css"
import axios from "axios"
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const List = ({ url, token }) => {

  const [list, setList] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [editImage, setEditImage] = useState(false)

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data)
    } else {
      toast.error("Error");
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const removeFood = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, { headers: { token } })
    await fetchList()
    if(response.data.success){
      toast.success(response.data.message)
    } else{
      toast.error("Error")
    }
  }

  const startEditing = (item) => {
    setEditingItem(item)
    setEditImage(false)
  }

  const onEditChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setEditingItem(prev => ({ ...prev, [name]: value }))
  }

  const onEditSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("id", editingItem._id)
    formData.append("name", editingItem.name)
    formData.append("description", editingItem.description)
    formData.append("price", Number(editingItem.price))
    formData.append("category", editingItem.category)
    if (editImage) {
      formData.append("image", editImage)
    }

    const response = await axios.post(`${url}/api/food/edit`, formData, { headers: { token } });
    if(response.data.success){
      setEditingItem(null)
      setEditImage(false)
      await fetchList()
      toast.success(response.data.message)
    } else{
      toast.error(response.data.message)
    }
  }

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/`+item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>₹{item.price}</p>
              <p className='action-container'>
                <span onClick={()=>startEditing(item)} className='cursor edit-action'>Edit</span>
                <span onClick={()=>removeFood(item._id)} className='cursor'>X</span>
              </p>
            </div>
          )
        })}
      </div>

      {editingItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Edit Food Item</h2>
              <span onClick={() => setEditingItem(null)} className='cursor close-modal'>X</span>
            </div>
            <form className='flex-col' onSubmit={onEditSubmit}>
              <div className="add-image-upload flex-col">
                <p>Upload Image</p>
                <label htmlFor="edit-image">
                  <img src={editImage ? URL.createObjectURL(editImage) : `${url}/images/${editingItem.image}`} alt="" />
                </label>
                <input onChange={(e)=>setEditImage(e.target.files[0])} type="file" id='edit-image' hidden />
              </div>
              <div className="add-product-name flex-col">
                <p>Product Name</p>
                <input onChange={onEditChangeHandler} value={editingItem.name} type="text" name='name' placeholder='Type here' required/>
              </div>
              <div className="add-product-description flex-col">
                <p>Product Description</p>
                <textarea onChange={onEditChangeHandler} value={editingItem.description} name="description" rows="4" placeholder='Write content here' required></textarea>
              </div>
              <div className="add-category-price">
                <div className="add-category flex-col">
                  <p>Product Category</p>
                  <select onChange={onEditChangeHandler} value={editingItem.category} name="category">
                    <option value="Salad">Salad</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Deserts">Deserts</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                  </select>
                </div>
                <div className="add-price flex-col">
                  <p>Product Price</p>
                  <input onChange={onEditChangeHandler} value={editingItem.price} type="number" name='price' placeholder='₹20' required/>
                </div>
              </div>
              <button type='submit' className='add-btn'>SAVE CHANGES</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
