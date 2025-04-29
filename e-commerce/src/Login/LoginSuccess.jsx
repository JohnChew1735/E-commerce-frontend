import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { AnimatePresence, motion } from "framer-motion";
import {
  PackagePlus,
  Box,
  List,
  Undo2,
  UserCircle,
  Heart,
  ShoppingCart,
  CalendarCheck,
  LogOut,
} from "lucide-react";

export function LoginSuccess() {
  const location = useLocation();
  const { username, userType } = location.state || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userID, setUserID] = useState("");
  const [averageRate, setAverageRate] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState("");
  const [bellColor, setBellColor] = useState("black");
  const [coins, setCoins] = useState(0 || null);

  //increase count of item
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

  //fetch top 10 items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await fetch("http://localhost:8000/get_all_items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!result.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await result.json();
        setItems(data.items[0]);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  //search item function
  const handleSearch = async () => {
    setSearchResults([]);

    if (!searchQuery.trim()) {
      alert("Please enter a search term.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/search_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.items[0]);
        console.log(data.items[0]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error", error);
      alert("Server error");
    }
  };

  //get customer or seller id
  useEffect(() => {
    const fetchUserID = async () => {
      if (userType === "customer") {
        try {
          const response = await fetch(
            "http://localhost:8000/get_customer_id",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            setUserID(data.data.id);
          } else {
            setUserID(null);
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
      if (userType === "seller") {
        try {
          const response = await fetch("http://localhost:8000/get_seller_id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          if (response.ok) {
            const data = await response.json();
            setUserID(data.data.id);
          } else {
            setUserID(null);
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
    };
    fetchUserID();
  }, [username, userType]);

  //fetch item ratings
  useEffect(() => {
    if (items.length === 0) return;
    const ratingsMap = {};
    const fetchItemsRatings = async () => {
      for (let index = 0; index < items.length; index++) {
        try {
          const response = await fetch(
            "http://localhost:8000/get_average_ratings",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ item_id: items[index].id }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            ratingsMap[items[index].id] = data.averageRating;
          } else {
            ratingsMap[items[index].id] = "N/A";
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
      setAverageRate(ratingsMap);
    };
    fetchItemsRatings();
  }, [items]);

  //get customer orders not read by seller
  useEffect(() => {
    async function getNotReadOrders() {
      if (userType === "seller") {
        try {
          const response = await fetch(
            "http://localhost:8000/get_not_read_orders",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.orders);
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
      if (userType === "customer") {
        try {
          const response = await fetch(
            "http://localhost:8000/get_customer_refund_as_customer",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.data);
          }
        } catch (error) {
          console.error("Error", error);
        }
      } else {
        return;
      }
    }
    getNotReadOrders();
  }, [userID, userType]);

  //setting item to read by seller
  async function setItemToRead(id) {
    try {
      const response = await fetch("http://localhost:8000/set_notread_to_yes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        alert("User item is being set to read");
        setNotifications(notifications.filter((n) => n.id !== id));
      } else {
        alert("User item is not being set to read");
        const data = response.json();
        console.log(data);
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //changing bell color
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setBellColor((prevColor) => (prevColor === "black" ? "green" : "black"));
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
          console.log(response);
          const data = await response.json();
          setCoins(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getCoinDetails();
  }, [userID]);

  //getting pending payment order
  useEffect(() => {
    const timer = setTimeout(() => {
      async function getAllPendingPaymentOrder() {
        try {
          const response = await fetch(
            "http://localhost:8000/get_all_payment_pending_orders",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            let pendingPaymentArray = [];
            for (let index = 0; index < data.data.length; index++) {
              pendingPaymentArray.push(data.data[index].id);
            }
          } else {
            return;
          }
        } catch (error) {
          console.error("Error getting pending payment order", error);
        }
      }
      getAllPendingPaymentOrder();
    }, 5000);
    return () => clearTimeout(timer);
  }, [userID, navigate]);

  const MenuItem = ({ icon, text, onClick, color, hover }) => (
    <motion.li
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${color} ${hover}`}
      onClick={onClick}
    >
      {icon}
      {text}
    </motion.li>
  );

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
              <div>
                {userType === "customer" && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                    }}
                    className="text-green-600"
                  >
                    &nbsp;Coins: {coins}💰
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex justify-between items-center p-2.5">
        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
        >
          <motion.div
            className="w-10 h-10 rounded-full bg-black flex items-center justify-center"
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-3 h-3 border-t-2 border-r-2 border-white rotate-45"
              animate={{ rotate: menuOpen ? 135 : 45 }}
            />
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer"
            onClick={handleBellClick}
          >
            <FaBell size={24} color={bellColor} />
          </motion.div>

          {notifications.length > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[-5px] right-[-5px] bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {notifications.length}
            </motion.span>
          )}

          {userType === "seller" && showNotifications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-[30px] right-10 bg-white border border-black p-4 rounded-lg min-w-[500px]"
            >
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={index}
                    className="flex justify-between items-center mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>
                      Customer <strong>{notification.customer_name}</strong>{" "}
                      ordered <strong>{notification.item_name}</strong> on{" "}
                      <strong>
                        {new Date(notification.order_date).toLocaleDateString(
                          "en-MY"
                        )}
                      </strong>
                    </span>
                    <motion.button
                      onClick={() => setItemToRead(notification.id)}
                      whileHover={{ scale: 1.1 }}
                      className="text-sm text-blue-500"
                    >
                      Done
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-400">
                  No new notifications
                </p>
              )}
            </motion.div>
          )}

          {userType === "customer" && showNotifications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute top-[30px] right-10 bg-white border border-black p-4 rounded-lg min-w-[1000px]"
            >
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={index}
                    className="flex justify-between items-center mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>
                      Order <strong>{notification.product_name}</strong>{" "}
                      refunded for reason of{" "}
                      <strong>{notification.refund_reason}</strong> has been{" "}
                      <strong>{notification.request_for_refund}</strong>
                    </span>
                    <motion.button
                      onClick={() => setItemToRead(notification.id)}
                      whileHover={{ scale: 1.1 }}
                      className="text-sm text-blue-500"
                    >
                      Noted
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-400">
                  No new notifications
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[100px] right-[1600px] p-4 bg-white border border-black rounded shadow-md z-50 w-64"
          >
            <ul className="space-y-2 text-sm">
              {userType === "seller" && (
                <>
                  <p className="font-semibold text-gray-500 text-xs px-1">
                    Seller Menu
                  </p>
                  <MenuItem
                    icon={<PackagePlus size={16} />}
                    text="Sell Item"
                    onClick={() =>
                      navigate("/SellItems", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-green-600"
                    hover="hover:bg-green-50"
                  />
                  <MenuItem
                    icon={<Box size={16} />}
                    text="Add Stock"
                    onClick={() =>
                      navigate("/AddStock", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-purple-600"
                    hover="hover:bg-purple-50"
                  />
                  <MenuItem
                    icon={<List size={16} />}
                    text="StockFlow"
                    onClick={() =>
                      navigate("/StockFlow", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-orange-500"
                    hover="hover:bg-orange-50"
                  />
                  <MenuItem
                    icon={<Box size={16} />}
                    text="My Items"
                    onClick={() =>
                      navigate("/MyItems", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-blue-600"
                    hover="hover:bg-blue-50"
                  />
                  <MenuItem
                    icon={<Undo2 size={16} />}
                    text="Customer Refund"
                    onClick={() =>
                      navigate("/CustomerRefund", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-black"
                    hover="hover:bg-gray-100"
                  />
                </>
              )}
              {userType === "customer" && (
                <>
                  <p className="font-semibold text-gray-500 text-xs px-1">
                    Customer Menu
                  </p>
                  <MenuItem
                    icon={<UserCircle size={16} />}
                    text="My Profile"
                    onClick={() =>
                      navigate("/Profile", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-yellow-800"
                    hover="hover:bg-yellow-50"
                  />
                  <MenuItem
                    icon={<Heart size={16} />}
                    text="My Wishlist"
                    onClick={() =>
                      navigate("/WishlistTable", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-gray-600"
                    hover="hover:bg-gray-100"
                  />
                  <MenuItem
                    icon={<ShoppingCart size={16} />}
                    text="Orders"
                    onClick={() =>
                      navigate("/Orders", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-green-600"
                    hover="hover:bg-green-50"
                  />
                  <MenuItem
                    icon={<Undo2 size={16} />}
                    text="Previous Refund"
                    onClick={() =>
                      navigate("/RefundTable", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-blue-600"
                    hover="hover:bg-blue-50"
                  />
                  <MenuItem
                    icon={<CalendarCheck size={16} />}
                    text="Daily Login"
                    onClick={() =>
                      navigate("/DailyLogin", {
                        state: { username, userType, userID },
                      })
                    }
                    color="text-purple-600"
                    hover="hover:bg-purple-50"
                  />
                </>
              )}
              <MenuItem
                icon={<LogOut size={16} />}
                text="Logout"
                onClick={() => navigate("/")}
                color="text-red-600"
                hover="hover:bg-red-50"
              />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <center>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="flex items-center justify-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your items here!"
            className="p-2 border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2 mb-10 w-72 sm:w-96 transition-all duration-300"
          />
          <motion.button
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSearch}
            className="text-3xl -mt-10"
          >
            🔎
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: 15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex items-center justify-center animate-shake"
        >
          <p className="text-4xl mb-4 font-bold text-red-600 drop-shadow-lg animate-pulse">
            ⚡ Trending Items ⚡
          </p>
        </motion.div>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            className="w-full md:w-3/4 lg:w-2/3 mb-10"
          >
            {(() => {
              const slides = [];
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const parsedImage = JSON.parse(item.images);
                const firstImage = parsedImage[2];
                slides.push(
                  <Link
                    to={`/product/${item.id}`}
                    state={{ username, userType, userID }}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={() => increaseClickCount(item.id)}
                    key={item.id}
                  >
                    <div className="flex items-center justify-between px-10 md:px-20 py-10 gap-8">
                      <img
                        className="w-48 h-48 object-contain rounded-lg shadow-md border border-gray-300"
                        src={firstImage}
                        alt={item.name}
                      />
                      <div className="text-left max-w-md">
                        <h2 className="text-2xl font-semibold mb-2">
                          {item.name}
                        </h2>
                        <p className="text-gray-700 whitespace-pre-line">
                          {item.description}
                        </p>
                        <p className="mt-4 font-medium text-purple-400">
                          👁️ {item.clicked} clicks
                        </p>
                        <p className="text-yellow-500 font-semibold">
                          {!averageRate[item.id] || isNaN(averageRate[item.id])
                            ? "⭐".repeat(0)
                            : "⭐".repeat(
                                Math.round(averageRate[item.id])
                              )}{" "}
                          <span className="text-gray-600">
                            (
                            {!averageRate[item.id] ||
                            isNaN(averageRate[item.id])
                              ? "0.0"
                              : Number(averageRate[item.id]).toFixed(1)}{" "}
                            / 5.0)
                          </span>
                        </p>
                        <p className="mt-4 font-bold text-blue-500">
                          RM {item.price}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }
              return slides;
            })()}
          </Carousel>
        </motion.div>
        <p className="text-4xl mb-10 font-bold">Search Results:</p>
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {(() => {
              const elements = [];
              for (let i = 0; i < searchResults.length; i++) {
                const item = searchResults[i];
                const parsedImage1 = JSON.parse(item.images);
                const finalImage = parsedImage1[1];
                elements.push(
                  <Link
                    to={`/product/${item.id}`}
                    state={{ username, userType, userID }}
                    style={{ textDecoration: "none", color: "inherit" }}
                    onClick={() => increaseClickCount(item.id)}
                    key={item.id}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow:
                          "0 0 30px rgba(59, 130, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.5)",
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="relative w-full h-96 cursor-pointer"
                      style={{
                        perspective: 1000,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-lg border border-blue-400 rounded-xl shadow-xl p-4 flex flex-col justify-center items-center">
                        <img
                          src={finalImage}
                          alt={item.name}
                          className="object-contain w-[180px] h-[180px] rounded cursor-pointer mx-auto"
                        />
                        <h2 className="mt-2 text-lg font-bold text-blue-700 text-center hover:underline">
                          {item.name}
                        </h2>
                        <p className="text-center text-sm">
                          Price: RM
                          {Number(item.price).toLocaleString("en-MY", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <div className="flex flex-col items-start text-xs text-gray-500 mb-3 w-full mt-4">
                          {item.description.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              }
              return elements;
            })()}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-semibold text-gray-600 mb-8"
            >
              Oops! No results found.
            </motion.p>
            <motion.img
              src="https://media4.giphy.com/media/4yvtv94IUWGBEUxFNs/giphy.gif?cid=6c09b9526n4z6oklj1eftp7ftwu0qja76tw03tlo16y9fm1l&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=ts"
              alt="Sad Emoji"
              initial={{ scale: 0 }}
              animate={{ scale: 2 }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 mx-auto mb-8"
            />
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-2xl font-semibold text-gray-600 mb-4"
            >
              We are working on improving so stay tuned!
            </motion.p>
          </motion.div>
        )}
      </center>
    </div>
  );
}
