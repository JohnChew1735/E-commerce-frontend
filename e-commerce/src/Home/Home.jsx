import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { motion } from "framer-motion";

export function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [averageRate, setAverageRate] = useState({});

  //increase count of item
  const increaseClickCount = async (id) => {
    try {
      const result = await fetch("http://localhost:8000/increase_click_count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await result.json();
      console.log(data.message);
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

  //test
  useEffect(() => {
    console.log("average rate", averageRate);
  }, [averageRate]);

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
        console.log("search result", data.items[0]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error", error);
      alert("Server error");
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Logo"
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            ShopSphere
          </h1>
          <button
            className="text-sm bg-white text-pink-500 px-2 py-1 rounded-full shadow-md font-medium animate-bounce"
            onClick={() => {
              navigate("/Login");
            }}
          >
            🎉 Big Deals!
          </button>
        </div>
        <div className="flex space-x-6 items-center">
          <motion.div>
            <motion.button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-blue-800 mr-4"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => navigate("/signup")}
              className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              Sign up
            </motion.button>
          </motion.div>
        </div>
      </div>
      <center>
        <p className="mb-4"></p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -100 }}
          animate={{ scale: 1.0, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="flex items-center justify-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your items here!"
            className="p-2 border border-gray-300 rounded-md shadow-md focus:ring-2 mr-2 mb-10 w-72 sm:w-96 transition-all duration-300"
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
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
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
                        <h2 className="text-3xl font-semibold mb-4">
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
                          RM{" "}
                          {Number(item.price).toLocaleString("en-MY", {
                            minimumFractionDigits: 2,
                          })}
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
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative w-full h-96 cursor-pointer"
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
