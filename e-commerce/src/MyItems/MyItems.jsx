import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function MyItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const { username, userType, userID } = location.state || {};

  //increase click count
  const increaseClickCount = async (id) => {
    try {
      await fetch("http://localhost:8000/increase_click_count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Error", error);
    }
  };

  //get all items sold by seller
  useEffect(() => {
    const getMyItems = async () => {
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
          console.log("myitems", data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };

    getMyItems();
  }, [userID]);

  //get item id
  async function getItemID(name, price) {
    try {
      const response = await fetch("http://localhost:8000/get_item_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          await deleteItems(data.data);
        } else {
          alert("Item ID not found");
        }
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //delete item based on id
  async function deleteItems(id) {
    console.log(id);
    try {
      const response = await fetch("http://localhost:8000/delete_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      console.log(response);
      if (response.ok) {
        alert("Item deleted");
        navigate("/LoginSuccess", { state: { username, userType, userID } });
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //get item id without the deleting function
  async function getItemIDWithoutDelete(name, price) {
    try {
      const response = await fetch("http://localhost:8000/get_item_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          const itemID = data.data;
          return itemID;
        } else {
          alert("Item ID not found");
        }
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
        <div className="font-bold text-3xl text-red-400 animate-pulse">
          My items
        </div>
        <motion.div
          className="overflow-x-auto p-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
            {myItems.length > 0 ? (
              myItems.map((item, index) => {
                const imagesArray = JSON.parse(item.images);
                const firstImage = imagesArray[0];

                return (
                  <motion.div
                    key={index}
                    whileHover={{
                      scale: 1.05,
                      boxShadow:
                        "0 0 30px rgba(59, 130, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.5)",
                    }}
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      {firstImage && (
                        <img
                          src={firstImage}
                          alt={`Product ${item.name}`}
                          className="w-full h-auto rounded-md"
                        />
                      )}
                      <h2
                        className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:underline"
                        onClick={() => {
                          increaseClickCount(item.id);
                          navigate(`/product/${item.id}`, {
                            state: { username, userType, userID },
                          });
                        }}
                      >
                        {item.name}
                      </h2>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Price:</span> RM
                        {Number(item.price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Stock:</span>{" "}
                        {item.stockCount}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-md shadow-md transition-all"
                        onClick={() => {
                          const response = window.confirm(
                            "Are you sure you want to delete this item?"
                          );
                          if (response) {
                            getItemID(item.name, item.price);
                          }
                        }}
                      >
                        Remove
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md shadow-md transition-all"
                        onClick={async () => {
                          try {
                            const finalItemID = await getItemIDWithoutDelete(
                              item.name,
                              item.price
                            );
                            if (finalItemID) {
                              navigate("/EditItems", {
                                state: {
                                  username,
                                  userType,
                                  userID,
                                  myItems,
                                  itemID: finalItemID,
                                },
                              });
                            } else {
                              alert("Failed to fetch item ID");
                            }
                          } catch (error) {
                            console.error("Error fetching item ID:", error);
                          }
                        }}
                      >
                        Edit
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-center col-span-full">
                No items to show
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
