import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrder, setPendingOrder] = useState("");
  const [completedOrder, setCompletedOrder] = useState("");
  const { username, userType, userID } = location.state || {};

  //get all pending orders
  useEffect(() => {
    const getPendingOrderDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_pending_order_details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPendingOrder(data.data);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    getPendingOrderDetails();
  }, [userID]);

  //checkout function
  async function checkout() {
    try {
      localStorage.setItem(
        "userData",
        JSON.stringify({ username, userID, userType })
      );
      const checkoutResponse = await fetch("http://localhost:8000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });

      if (!checkoutResponse.ok) {
        alert("User order not checked out");
        return;
      }
      navigate("/PaymentPage", { state: { username, userType, userID } });
    } catch (error) {
      console.error("Error during checkout", error);
    }
  }

  //get completed orders
  useEffect(() => {
    const getCompletedOrderDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_completed_order_details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCompletedOrder(data.data);
          console.log("data", data.data);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    getCompletedOrderDetails();
  }, [userID]);

  //allow user to delete order and add back the coins
  const deleteOrder = async (orderID, coinsUsed) => {
    if (coinsUsed > 0) {
      try {
        const response = await fetch(
          "http://localhost:8000/increase_customer_coins_more_than_10coins",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID, coinsUsed }),
          }
        );
        console.log(userID, coinsUsed);
        if (response.ok) {
          try {
            const response = await fetch(
              "http://localhost:8000/delete_orders",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, orderID }),
              }
            );
            if (response.ok) {
              alert("Order deleted");
            } else {
              alert("Order not deleted");
            }
          } catch (error) {
            console.error("Error deleting order", error);
          }
        }
      } catch (error) {
        console.error("Error increasing customer coins", error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:8000/delete_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, orderID }),
        });
        if (response.ok) {
          alert("Order deleted");
        } else {
          alert("Order not deleted");
        }
      } catch (error) {
        console.error("Error deleting order", error);
      }
    }
  };

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
      <center>
        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60 }}
          className="text-4xl font-bold text-purple-600 drop-shadow-lg animate-pulse"
        >
          Items in Cart
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4">
          {pendingOrder.length > 0 ? (
            pendingOrder.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.08,
                  boxShadow:
                    "0 0 30px rgba(59, 130, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.5)",
                }}
                transition={{ duration: 0.3 }}
                className="relative bg-white/30 backdrop-blur-sm border border-blue-200 rounded-xl shadow-md p-4 flex flex-col gap-3 items-center"
              >
                <img
                  src={item.product_images}
                  alt={item.product_name}
                  className="w-28 h-28 object-cover rounded-md"
                />
                <h2 className="font-semibold text-center">
                  {item.product_name}
                </h2>
                <p>Quantity: {item.quantity}</p>
                <p>
                  Price: RM{" "}
                  {Number(item.price).toLocaleString("en-MY", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  Coins Discount: RM{" "}
                  {Number(item.discount_from_coins).toLocaleString("en-MY", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="font-bold text-green-600">
                  Total: RM{" "}
                  {(
                    Number(item.quantity) * Number(item.price) -
                    Number(item.discount_from_coins)
                  ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                </p>
                <motion.button
                  onClick={() => {
                    deleteOrder(item.id, item.discount_from_coins);
                    navigate("/loginSuccess", {
                      state: { username, userType, userID },
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </motion.button>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-gray-500"
            >
              No items in cart 🛒
            </motion.p>
          )}
        </div>

        {/* Proceed to Checkout Button */}
        {pendingOrder.length > 0 && (
          <div className="flex justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md mb-10"
              onClick={() => {
                checkout();
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 20 }}
            >
              Proceed to Checkout
            </motion.button>
          </div>
        )}
        <p className="mb-10"></p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-indigo-600 text-center my-8 drop-shadow-lg">
            Previous Orders 📦
          </h1>

          <div className="relative border-l-4 border-indigo-300 ml-4">
            {completedOrder.length > 0 ? (
              completedOrder.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="mb-10 ml-6"
                >
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-full -left-4 ring-2 ring-blue">
                    {index + 1}
                  </span>

                  <div className="p-6 bg-white/30 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.product_images}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">
                          {item.product_name}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Ordered on{" "}
                          {new Date(item.order_date).toLocaleDateString(
                            "en-MY",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>Price per item:</strong> RM{" "}
                        {Number(item.price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p>
                        <strong>Coins Discount:</strong> RM{" "}
                        {Number(item.discount_from_coins).toLocaleString(
                          "en-MY",
                          { minimumFractionDigits: 2 }
                        )}
                      </p>
                      <p className="font-bold text-green-600">
                        Total Paid: RM{" "}
                        {(
                          Number(item.quantity) * Number(item.price) -
                          Number(item.discount_from_coins)
                        ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          item.rating === "Completed"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        Rating: {item.rating}
                      </span>

                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          item.request_for_refund === "Approved"
                            ? "bg-green-200 text-green-800"
                            : item.request_for_refund === "Denied"
                            ? "bg-red-200 text-red-800"
                            : item.request_for_refund ===
                              "Yes, pending approval"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Refund Status: {item.request_for_refund}
                      </span>

                      {item.refund_reason &&
                        item.request_for_refund !== "No" && (
                          <span className="px-3 py-1 text-sm bg-pink-200 text-pink-800 rounded-full">
                            Reason: {item.refund_reason}
                          </span>
                        )}
                    </div>

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={
                          item.rating === "Pending"
                            ? () =>
                                navigate("/Ratings", {
                                  state: {
                                    userID,
                                    username,
                                    userType,
                                    orderID: item.id,
                                    itemID: item.item_id,
                                  },
                                })
                            : null
                        }
                        className={`px-4 py-2 rounded ${
                          item.rating === "Pending"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={item.rating !== "Pending"}
                      >
                        {item.rating === "Pending" ? "⭐ Rate Now" : "Rated"}
                      </button>
                      <button
                        onClick={
                          item.request_for_refund === "No"
                            ? () =>
                                navigate("/Refund", {
                                  state: {
                                    userID,
                                    username,
                                    userType,
                                    item,
                                  },
                                })
                            : null
                        }
                        disabled={item.request_for_refund !== "No"}
                        className={`px-4 py-2 rounded ${
                          item.request_for_refund === "No"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : item.request_for_refund === "Approved"
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : item.request_for_refund === "Denied"
                            ? "bg-red-500 text-white cursor-not-allowed"
                            : "bg-orange-400 text-white cursor-not-allowed"
                        }`}
                      >
                        {item.request_for_refund === "No"
                          ? "🔁 Request for refund"
                          : item.request_for_refund === "Approved"
                          ? "✅ Approved"
                          : item.request_for_refund === "Denied"
                          ? "✖️ Denied"
                          : item.request_for_refund === "Yes, pending approval"
                          ? "⏳ Pending"
                          : ""}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 my-10">
                No completed orders yet!
              </p>
            )}
          </div>
        </motion.div>
      </center>
    </div>
  );
}
