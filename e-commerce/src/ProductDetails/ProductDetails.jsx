import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export function ProductDetails() {
  const { id } = useParams();
  const [itemDetails, setItemDetails] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const [quantity, setQuantity] = useState(1);
  const [coins, setCoins] = useState(0 || null);
  const [useAllCoins, setUseAllCoins] = useState(false);
  const [customerFeedback, setCustomerFeedback] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  //get item details
  const getItemDetails = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:8000/get_product_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setItemDetails(data.details);
        console.log("item details", data.details);
      } else {
        setItemDetails("No description found.");
      }
    } catch (error) {
      console.error("Error", error);
      setItemDetails("Error loading description.");
    }
  };

  //get item details
  useEffect(() => {
    getItemDetails(id);
  }, [id]);

  const navigate = useNavigate();

  //control the quantity of product
  const increaseQuantity = () => {
    setQuantity(Number(quantity) + 1);
  };
  const decreaseQuantity = () => {
    setQuantity(quantity > 1 ? Number(quantity) - 1 : 1);
  };

  //add item to customer order table and include use coins for discount
  const addItemToCart = async () => {
    if (useAllCoins) {
      try {
        const response = await fetch("http://localhost:8000/add_item_to_cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: userID,
            item_id: itemDetails.id,
            quantity: quantity,
            price: itemDetails.price,
            discount_from_coins: coins,
          }),
        });
        if (response.ok) {
          try {
            const response = await fetch(
              "http://localhost:8000/reduce_customer_coins",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userID }),
              }
            );
            if (response.ok) {
              alert("Item added to the cart");
              navigate("/Orders", { state: { username, userType, userID } });
            }
          } catch (error) {
            console.error("Error reducing customer coins", error);
          }
        }
      } catch (error) {
        console.error("Error adding item to cart", error);
      }
    }
    if (!useAllCoins) {
      try {
        const response = await fetch("http://localhost:8000/add_item_to_cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: userID,
            item_id: itemDetails.id,
            quantity: quantity,
            price: itemDetails.price,
            discount_from_coins: 0,
          }),
        });
        if (response.ok) {
          alert("Item added to the cart");
          navigate("/Orders", { state: { username, userType, userID } });
        }
      } catch (error) {
        console.error("Error adding item to cart", error);
      }
    }
  };

  //get coin details based on userID
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
          setCoins(data.data);
        } else {
          setCoins(0);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getCoinDetails();
  }, [userID]);

  //get customer feedback
  useEffect(() => {
    async function getCustomerFeedback() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_customer_feedback_from_productID",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemDetails.id }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCustomerFeedback(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getCustomerFeedback();
  }, [itemDetails]);

  //handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //get all item and push them into an array
  useEffect(() => {
    if (itemDetails?.images) {
      const images = JSON.parse(itemDetails.images);
      setItemImages(images);
    }
  }, [itemDetails]);

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-md py-4 px-6 flex justify-between items-center mb-3 fixed top-0 left-0 w-full z-50">
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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <button
          className="fixed top-[80px] left-4 text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
          onClick={() =>
            username || userType || userID
              ? navigate("/loginSuccess", {
                  state: { username, userType, userID },
                })
              : navigate("/")
          }
        >
          Back
        </button>
        <motion.div
          className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center space-y-12 z-50 pointer-events-none"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.3 } },
            hidden: {},
          }}
        >
          {/* Item Name */}
          <motion.p
            className="text-7xl font-extrabold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: scrollPosition < 2000 ? 1 : 0,
              y: scrollPosition < 2000 ? 0 : -40,
              scale: scrollPosition < 2000 ? 1 : 1.3,
              filter: scrollPosition < 2000 ? "blur(0px)" : "blur(6px)",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {itemDetails.name}
          </motion.p>

          {/* Price */}
          <motion.p
            className="text-6xl font-bold text-yellow-300 drop-shadow-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: scrollPosition < 2000 ? 1 : 0,
              y: scrollPosition < 2000 ? 0 : -40,
              scale: scrollPosition < 2000 ? 1 : 1.3,
              filter: scrollPosition < 2000 ? "blur(0px)" : "blur(6px)",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            For only{" "}
            {Number(itemDetails.price).toLocaleString("en-MY", {
              style: "currency",
              currency: "MYR",
            })}
          </motion.p>

          {/* Views */}
          <motion.p
            className="text-5xl font-semibold text-white/80"
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: scrollPosition < 2000 ? 1 : 0,
              y: scrollPosition < 2000 ? 0 : -40,
              scale: scrollPosition < 2000 ? 1 : 1.3,
              filter: scrollPosition < 2000 ? "blur(0px)" : "blur(6px)",
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            Viewed {itemDetails.clicked} times
          </motion.p>
        </motion.div>

        <div className="fixed top-[200px] left-1/2 transform -translate-x-1/2 text-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: scrollPosition >= 2500 && scrollPosition < 5000 ? 1 : 0,
              y: scrollPosition >= 2500 && scrollPosition < 5000 ? 0 : 50,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div className="space-y-4">
              {itemDetails.description
                ?.replace(/\r\n|\r/g, "\n")
                .split("\n")
                .map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity:
                        scrollPosition >= 2500 && scrollPosition < 5000 ? 1 : 0,
                      y:
                        scrollPosition >= 2500 && scrollPosition < 5000
                          ? 0
                          : 20,
                    }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="text-3xl font-extrabold text-white"
                  >
                    {line}
                  </motion.p>
                ))}
            </div>
          </motion.div>
        </div>

        <div className="h-[6300px]"></div>
      </div>
      <div className="h-[300px] bg-gradient-to-b from-black to-white"></div>
      <div className="h-[400px] bg-white text-black px-8 py-10">
        <motion.div
          className="rounded-t-3xl max-w-5xl mx-auto border-t border-gray-200"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Universal Section: Item Name, Description, Price, and Clicked */}
          <div className="bg-white text-black bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 space-y-3 flex flex-col items-start shadow-lg w-full md:w-auto">
            {/* Item Name */}
            <h2 className="text-xl font-semibold text-black">
              {itemDetails.name}
            </h2>
            <Carousel
              showThumbs={false}
              autoPlay
              infiniteLoop
              className="w-full md:w-3/4 lg:w-2/3 mb-10"
            >
              {itemImages.map((imgSrc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center px-10 md:px-20 py-10"
                >
                  <img
                    className="w-48 h-48 object-contain rounded-lg shadow-md border border-gray-300"
                    src={imgSrc}
                    alt={`Item ${index + 1}`}
                  />
                </div>
              ))}
            </Carousel>
            {/* Item Description */}
            <div className="text-sm text-gray-700 space-y-1">
              {itemDetails.description
                ?.split("\n")
                .map((line, index) => <p key={index}>{line}</p>) || (
                <p>No description available.</p>
              )}
            </div>
            {/* Item Price */}
            <p className="text-lg font-bold text-black">
              Price: RM{" "}
              {Number(itemDetails.price).toLocaleString("en-MY", {
                style: "currency",
                currency: "MYR",
              })}
            </p>
            {/* Clicked State */}
            <p className="text-sm text-gray-500">
              Clicked: {itemDetails.clicked}
            </p>
            <h3 className="text-base font-semibold text-black mb-2">
              Customer Feedback
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {customerFeedback && customerFeedback.length > 0 ? (
                customerFeedback.map((fb, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-md p-3 shadow-sm"
                  >
                    <p className="text-sm text-gray-800">
                      “{fb.customer_feedback}”
                    </p>
                    <p className="text-xs text-gray-500 italic text-right mt-1">
                      — {fb.customerName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No feedback yet.</p>
              )}
            </div>
          </div>

          {/* Customer-Specific Section */}
          {userType === "customer" && (
            <div className="bg-white text-black bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 space-y-3 flex flex-col items-end shadow-lg w-full md:w-auto">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseQuantity}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xl"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 text-center rounded-md px-2 py-1 bg-white text-black border border-gray-300"
                />
                <button
                  onClick={increaseQuantity}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xl"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-lg font-semibold transition"
                onClick={async () => {
                  const confirmAdd = window.confirm(
                    "Are you sure you want to add this item to the cart?"
                  );
                  if (confirmAdd) {
                    if (quantity < 1) {
                      alert("Item quantity cannot be less than 1.");
                      return;
                    }
                    if (itemDetails.stockCount - quantity < 0) {
                      alert(
                        `Maximum you can order is ${itemDetails.stockCount}`
                      );
                    } else {
                      const response = await addItemToCart();
                      if (response) {
                        alert("Item added to cart.");
                        navigate("/Orders", {
                          state: {
                            userType,
                            username,
                            userID,
                            itemDetails,
                            quantity,
                          },
                        });
                      }
                    }
                  }
                }}
              >
                Add to Cart
              </button>

              {/* Coins Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coinCheckboxBottom"
                  checked={useAllCoins}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const confirm = window.confirm(
                        `Use all ${coins} coins for RM${coins}.00 discount?`
                      );
                      if (confirm) setUseAllCoins(true);
                    } else {
                      setUseAllCoins(false);
                    }
                  }}
                  className="w-5 h-5"
                />
                <label
                  htmlFor="coinCheckboxBottom"
                  className="text-sm text-black"
                >
                  Use all {coins} coins
                </label>
              </div>

              {/* Wishlist */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded-xl text-base transition"
                onClick={() =>
                  navigate("/Wishlist", {
                    state: { username, userType, userID, itemDetails },
                  })
                }
              >
                Add to Wishlist
              </button>

              {/* Stock Count */}
              <p className="text-sm text-gray-700">
                Stock left: {itemDetails.stockCount || 0}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
