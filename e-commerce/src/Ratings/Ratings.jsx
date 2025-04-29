import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export function Ratings() {
  const [itemDetails, setItemDetails] = useState("");
  const location = useLocation();
  const { username, userType, userID, itemID, orderID } = location.state || {};
  const navigate = useNavigate();
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  //set item details function
  const getItemDetails = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/get_product_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setItemDetails(data.details);
      } else {
        setItemDetails("No description found.");
      }
    } catch (error) {
      console.error("Error", error);
      setItemDetails("Error loading description.");
    }
  }, [itemID]);

  //debug
  useEffect(() => {
    console.log(rating);
  }, [rating]);

  // if item id exist, run the function to set item details
  useEffect(() => {
    if (itemID) {
      getItemDetails();
    }
  }, [itemID, getItemDetails]);

  //update product rating
  async function updateProductRating(rating, orderID) {
    try {
      const response = await fetch("http://localhost:8000/update_rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_rating: rating, id: orderID }),
      });
      if (response.ok) {
        alert("User ratings updated");
      } else {
        alert("User ratings not updated");
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  async function handleAddCustomerFeedback() {
    try {
      const response = await fetch(
        "http://localhost:8000/add_customer_feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemID,
            customer_id: userID,
            customerFeedback: feedback,
          }),
        }
      );
      if (response.ok) {
        console.log("User feedback added");
      } else {
        console.log("User feedback not added.");
      }
    } catch (error) {
      console.error("Error adding customer feedback");
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
          navigate("/Orders", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <div className="flex flex-col p-4 items-center">
        <div className="text-3xl font-bold text-purple-500 animate-pulse mb-10">
          Rate your item
        </div>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        >
          <div className="bg-white-100 rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex flex-col gap-4 p-4 items-center">
              <Carousel
                showThumbs={false}
                autoPlay
                infiniteLoop
                className="w-full md:w-3/4 lg:w-2/3 mb-10"
              >
                {itemDetails.images &&
                  (() => {
                    try {
                      const images = JSON.parse(itemDetails.images);
                      return images.map((img, index) => (
                        <img
                          key={index}
                          src={img.trim()}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: "300px",
                            height: "300px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      ));
                    } catch (error) {
                      console.error("Error parsing images JSON:", error);
                      return <p>Error loading images</p>;
                    }
                  })()}
              </Carousel>
              <p className="text-4xl font-green-400 font-medium mb-5">
                {itemDetails?.name}
              </p>
              <div className="flex gap-3">
                {(() => {
                  let stars = [];
                  for (let index = 1; index < 6; index++) {
                    stars.push(
                      <span
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(rating)}
                      >
                        <FaStar
                          size={30}
                          color={
                            index <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                          }
                          style={{
                            transform: `scale(${
                              index <= (hover || rating) ? 1.2 : 1
                            })`,
                            transition: "transform 0.3s ease-in-out",
                          }}
                        />
                      </span>
                    );
                  }
                  return stars;
                })()}
              </div>
              <p className="font-2xl font-medium ">
                Your Rating:&nbsp;{rating}&nbsp;Stars&nbsp;&nbsp;
              </p>
              <p className="font-2xl font-medium ">
                Price: &nbsp;RM
                {Number(itemDetails?.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="text-2xl font-medium">Details:</div>
              <ul className="mb-10">
                {itemDetails.description?.split("\n").map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <p className="text-4xl font-medium text-green-500">
                Submit your feedback:
              </p>
              <motion.textarea
                className="w-full max-w-lg h-48 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition-all duration-300"
                onChange={(e) => setFeedback(e.target.value)}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 },
                }}
                placeholder="Enter your feedback here..."
              />

              <motion.button
                onClick={() => {
                  updateProductRating(rating, orderID);
                  handleAddCustomerFeedback();
                  navigate("/loginSuccess", {
                    state: { userID, username, userType },
                  });
                }}
                className="bg-orange-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-orange-600 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit feedback
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
