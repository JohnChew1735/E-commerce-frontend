import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function StockFlow() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [itemID, setItemID] = useState(0);
  const [itemStockFlow, setItemStockFlow] = useState([]);
  const [showTable, setShowTable] = useState(false);

  //get all items from the seller
  useEffect(() => {
    async function getAllItems() {
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
    getAllItems();
  }, [userID]);

  //debug
  useEffect(() => {
    console.log(myItems);
  }, [myItems]);

  //get all stock flow based on product ID
  async function getStockFlow() {
    try {
      const response = await fetch("http://localhost:8000/get_all_stock_flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemID }),
      });

      if (response.ok) {
        const data = await response.json();
        setItemStockFlow(data.data);
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //calculate total stock left
  const totalStockLeft = (() => {
    let total = 0;
    for (let index = 0; index < itemStockFlow.length; index++) {
      if (itemStockFlow[index].inOrOut === "In") {
        total += itemStockFlow[index].amount;
      } else if (itemStockFlow[index].inOrOut === "Out") {
        total -= itemStockFlow[index].amount;
      }
    }
    return total;
  })();

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
        onClick={() =>
          username || userType || userID
            ? navigate("/loginSuccess", {
                state: { username, userType, userID },
              })
            : navigate("/Home")
        }
        className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
      >
        Back
      </button>
      <div className="flex flex-col items-center p-6">
        <div className="text-4xl font-bold text-red-500 animate-pulse mb-4">
          Stock Movement
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto space-y-6 mt-10 mb-10"
        >
          <label className="text-2xl font-bold text-gray-800">
            Select your product
          </label>

          <select
            onChange={(e) => setItemID(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
          >
            <option value="">Please select an option</option>
            {myItems.map((item, index) => (
              <option key={index} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              setShowTable(false);
              await getStockFlow();
              setShowTable(true);
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-md shadow-md hover:bg-blue-600 transition-all"
          >
            Get Stock Flow Details
          </motion.button>
        </motion.div>
        {showTable && (
          <motion.div
            className="overflow-x-auto p-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <p className="text-3xl font-medium text-gray-800 mb-8">
              The below table displays the stock movement for the product
            </p>
            <div className="flex justify-center">
              <table className="w-4/5 border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-pink-200 text-gray-800 text-center uppercase tracking-wider">
                    <td className="px-3 py-4 border font-semibold text-lg">
                      Date
                    </td>
                    <td className="px-3 py-4 border font-semibold text-lg">
                      Time
                    </td>
                    <td className="px-3 py-4 border font-semibold text-lg">
                      Amount
                    </td>
                    <td className="px-3 py-4 border font-semibold text-lg">
                      Product In/ Out
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let productStockFlow = [];
                    for (let index = 0; index < itemStockFlow.length; index++) {
                      productStockFlow.push(
                        <tr
                          key={index}
                          className="hover:bg-gray-300 bg-gray-100 transition-all duration-300 ease-in-out"
                        >
                          <td className="px-4 py-3 border">
                            {new Date(
                              itemStockFlow[index].date
                            ).toLocaleDateString("en-MY", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 border">
                            {new Date(itemStockFlow[index].date).toLocaleString(
                              "en-MY",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </td>
                          <td className="px-4 py-3 border">
                            {itemStockFlow[index].inOrOut === "Out"
                              ? `(${itemStockFlow[index].amount})`
                              : itemStockFlow[index].amount}
                          </td>
                          <td className="px-4 py-3 border">
                            {itemStockFlow[index].inOrOut}
                          </td>
                        </tr>
                      );
                    }
                    return productStockFlow.length > 0 ? (
                      productStockFlow
                    ) : (
                      <tr>
                        <td
                          className="bg-gray-100 italic text-gray-500 px-4 py-3 border text-center"
                          colSpan="4"
                        >
                          {" "}
                          Nothing to show
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
              <p className="p-5"></p>
              <div className="w-1/4 bg-blue-100 rounded-xl p-6 shadow-md text-center">
                <p className="text-xl font-semibold text-blue-800 mb-2">
                  Stock Amount
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {itemStockFlow.length > 0
                    ? `${totalStockLeft} stocks left`
                    : "No stock data available"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
