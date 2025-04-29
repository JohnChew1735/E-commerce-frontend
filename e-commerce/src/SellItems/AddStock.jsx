import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AddStock() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const [myItems, setMyItems] = useState([]);
  const navigate = useNavigate();
  const [finalImages, setFinalImages] = useState("");
  const [stockAmount, setStockAmount] = useState(0);

  //get all items sold by the seller
  useEffect(() => {
    async function getAllItemsBySeller() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_item_by_seller",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMyItems(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getAllItemsBySeller();
  }, [userID]);

  //convert image into correct format
  useEffect(() => {
    let imagesArray = [];
    for (let index = 0; index < myItems.length; index++) {
      const image = JSON.parse(myItems[index].images);
      imagesArray.push(image[0]);
    }
    setFinalImages(imagesArray);
  }, [myItems]);

  //add stock count function
  async function addStockCount(item_id, amount, userID) {
    try {
      const response = await fetch("http://localhost:8000/update_stock_flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id,
          amount,
          inOrOut: "In",
          sellerID: userID,
        }),
      });
      if (response.ok) {
        alert("Stock count for that inventory has been updated");
        window.location.reload();
      } else {
        alert(
          "Stock count for that inventory is not updated. Please check if the inventory amount is in correct format."
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-md py-4 px-6 flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Logo"
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            ShopSphere
          </h1>
          <button className="text-sm bg-white text-pink-500 px-2 py-1 rounded-full shadow-md font-medium animate-bounce">
            🎉 Big Deals!
          </button>
        </div>
        <div className="flex space-x-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <div>
              <span>Logged in as: </span>
              <strong className="text-blue-700">{username}</strong> (
              <span className="text-purple-500">{userType}</span>)
            </div>
          </motion.div>
        </div>
      </div>
      <button
        className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
        onClick={() => {
          navigate("/loginSuccess", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <div className="flex flex-col items-center p-6">
        <div className="text-4xl font-bold text-blue-700 animate-pulse mb-10">
          Add items
        </div>
        <motion.div
          className="overflow-x-auto p-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-3 border">Product Name</th>
                <th className="px-4 py-3 border">Current Stock</th>
                <th className="px-4 py-3 border">Add Amount</th>
                <th className="px-4 py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {myItems.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-300"
                >
                  <td className="flex items-center gap-3 px-4 py-3 border">
                    <img
                      src={finalImages[index]}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg shadow"
                    />
                    <span className="font-semibold">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 border">{item.stockCount}</td>
                  <td className="px-4 py-3 border">
                    <input
                      type="number"
                      value={item.stockAmount}
                      onChange={(e) => setStockAmount(e.target.value)}
                      className="border rounded-md px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        addStockCount(item.id, stockAmount, userID)
                      }
                      className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-md shadow-md transition-all duration-300"
                    >
                      Add Stock
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
