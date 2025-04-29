import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function WishlistTable() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, userType, userID } = location.state || {};
  const [myWishList, setMyWishList] = useState([]);
  const [myWishListFirstImage, setMyWishListFirstImage] = useState([]);
  const [myCoins, setMyCoins] = useState(0);

  //get coin details
  useEffect(() => {
    async function getCoinDetails() {
      try {
        const response = await fetch("http://localhost:8000/get_coin_details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userID }),
        });
        if (response.ok) {
          const data = await response.json();
          setMyCoins(data.data);
        }
      } catch (error) {
        console.error("Error getting coin details", error);
      }
    }
    getCoinDetails();
  }, [userID]);

  //get all wishlist based on userID
  useEffect(() => {
    async function getMyWishList() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_wishlist_based_on_userID",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMyWishList(data.data);
        }
      } catch (error) {
        console.error("Error getting wishlist", error);
      }
    }
    getMyWishList();
  }, [userID]);

  //converting images into correct format
  useEffect(() => {
    async function getMyWishListItemsImages() {
      let productImages = [];
      for (let index = 0; index < myWishList.length; index++) {
        const allImages = await JSON.parse(myWishList[index].images);
        productImages.push(allImages[0]);
      }
      setMyWishListFirstImage(productImages);
    }
    getMyWishListItemsImages();
  }, [myWishList]);

  //handling adding to cart from wishlist
  async function handleAddToCart(wishlistID, itemID, quantity, price) {
    if (myCoins === 0) {
      try {
        const updateWishlistResponse = await fetch(
          "http://localhost:8000/update_wishlist",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: wishlistID }),
          }
        );
        if (updateWishlistResponse.ok) {
          try {
            const addItemToCartResponse = await fetch(
              "http://localhost:8000/add_item_to_cart",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customer_id: userID,
                  item_id: itemID,
                  quantity: quantity,
                  price: price,
                  discount_from_coins: myCoins,
                }),
              }
            );
            if (addItemToCartResponse.ok) {
              alert(
                "Successfully adding item to cart and not using customer coins."
              );
              navigate("/Orders", {
                state: { username, userType, userID },
              });
            } else {
              console.log("Error adding item to cart.");
            }
          } catch (error) {
            console.error("Error adding item to cart", error);
          }
        }
      } catch (error) {
        console.error("Error updating wishlist table", error);
      }
    } else {
      const coinResponse = window.confirm(
        `You have ${myCoins} coins. Do you want to use the coins for discount?`
      );
      if (coinResponse) {
        alert("Using coins for additional discount.");
        try {
          const updateWishlistResponse = await fetch(
            "http://localhost:8000/update_wishlist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: wishlistID }),
            }
          );
          if (updateWishlistResponse.ok) {
            try {
              const addItemToCartResponse = await fetch(
                "http://localhost:8000/add_item_to_cart",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer_id: userID,
                    item_id: itemID,
                    quantity: quantity,
                    price: price,
                    discount_from_coins: myCoins,
                  }),
                }
              );
              if (addItemToCartResponse.ok) {
                try {
                  const reducingCoinsResponse = await fetch(
                    "http://localhost:8000/reduce_customer_coins",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: userID }),
                    }
                  );
                  if (reducingCoinsResponse.ok) {
                    alert(
                      "Successfully added item to cart and using coins for discount."
                    );
                    navigate("/Orders", {
                      state: { username, userType, userID },
                    });
                  } else {
                    console.log(
                      "Error adding item to cart and error reducing customer coins."
                    );
                  }
                } catch (error) {
                  console.error("Error reducing customer coin.", error);
                }
              }
            } catch (error) {
              console.error("Error adding item to cart", error);
            }
          }
        } catch (error) {
          console.error("Error updating wishlist table", error);
        }
      } else {
        alert("Not using coins for additional discount.");
        try {
          const updateWishlistResponse = await fetch(
            "http://localhost:8000/update_wishlist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: wishlistID }),
            }
          );
          if (updateWishlistResponse.ok) {
            try {
              const addItemToCartResponse = await fetch(
                "http://localhost:8000/add_item_to_cart",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer_id: userID,
                    item_id: itemID,
                    quantity: quantity,
                    price: price,
                    discount_from_coins: myCoins,
                  }),
                }
              );
              if (addItemToCartResponse.ok) {
                alert(
                  "Successfully adding item to cart and not using customer coins."
                );
                navigate("/Orders", {
                  state: { username, userType, userID },
                });
              } else {
                console.log("Error adding item to cart.");
              }
            } catch (error) {
              console.error("Error adding item to cart", error);
            }
          }
        } catch (error) {
          console.error("Error updating wishlist table", error);
        }
      }
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
      <div className="flex flex-col items-center justify-center mt-6">
        <motion.p className="text-4xl font-bold text-green-600 drop-shadow-lg animate-pulse">
          My Wishlist Table
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {myWishList.map((item, index) => {
          const image = myWishListFirstImage[index];
          const totalPrice = Number(item.price) * Number(item.quantity);
          const statusText =
            item.status === "active"
              ? "🛒 In Wishlist"
              : item.status === "added to cart"
              ? "🛒 Added"
              : "✅ Purchased";

          return (
            <motion.div
              key={item.wishlistID}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-white/30 backdrop-blur-lg border border-white/50 rounded-xl shadow-xl p-4 overflow-hidden group"
            >
              {/* Front */}
              <div className="transition-transform duration-500 ease-in-out">
                <img
                  src={image}
                  alt={item.name}
                  className="object-contain w-[180px] h-[180px] rounded mx-auto"
                />
                <p className="mt-2 text-lg font-bold text-blue-700 text-center">
                  {item.name}
                </p>
                <p className="text-center">Quantity: {item.quantity}</p>
                <p className="text-center">
                  Price: RM
                  {Number(item.price).toLocaleString("en-MY", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-center">
                  Total: RM
                  {totalPrice.toLocaleString("en-MY", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm italic text-center mt-1">{statusText}</p>
              </div>

              {/* Back (Revealed on hover) */}
              <div className="absolute inset-0 transform rotate-y-180 opacity-0 group-hover:opacity-100 group-hover:rotate-y-0 transition-all duration-500 ease-in-out flex flex-col justify-center items-center bg-white/60 backdrop-blur-lg p-4">
                <textarea
                  value={item.note}
                  disabled
                  className="w-full text-sm border rounded p-2 mb-2"
                />
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(item.created_at).toLocaleDateString("en-MY")} @{" "}
                  {new Date(item.created_at).toLocaleTimeString("en-MY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {item.status === "added to cart" ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded text-gray-600 bg-yellow-300"
                  >
                    Added to cart
                  </button>
                ) : item.status === "active" ? (
                  <motion.button
                    onClick={() =>
                      handleAddToCart(
                        item.wishlistID,
                        item.item_id,
                        item.quantity,
                        item.price
                      )
                    }
                    className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add to Cart
                  </motion.button>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
