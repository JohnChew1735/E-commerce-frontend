import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export function Wishlist() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, userType, userID, itemDetails } = location.state || {};
  const [itemImage, setItemImage] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [itemNote, setItemNote] = useState("");

  //setting image to correct format
  useEffect(() => {
    const imagesArray = JSON.parse(itemDetails.images);
    setItemImage(imagesArray);
  }, [itemDetails]);

  //handle add to wishlist
  async function handleAddToWishlist() {
    try {
      const response = await fetch("http://localhost:8000/add_to_wishlist", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          item_id: itemDetails.id,
          customer_id: userID,
          quantity: quantity,
          note: itemNote,
        }),
      });
      if (response.ok) {
        alert("Wishlist added");
        navigate("/WishlistTable", { state: { username, userType, userID } });
      } else {
        alert("Wishlist not added.");
      }
    } catch (error) {
      console.error("Error adding to wishlist", error);
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
        <div className="text-3xl font-bold text-purple-500 animate-pulse mb-6">
          Adding to Wishlist
        </div>
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            className="mb-6 rounded-lg overflow-hidden"
          >
            {itemImage.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={itemDetails.name}
                className="object-cover w-full h-48"
              />
            ))}
          </Carousel>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Product Name:
              </label>
              <input
                value={itemDetails.name}
                disabled
                className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Quantity:
              </label>
              <motion.input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400"
                whileHover={{
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Item Note:
              </label>
              <motion.textarea
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400"
                rows="4"
                whileHover={{
                  boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)",
                }}
              ></motion.textarea>
            </div>

            <motion.button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-lg font-semibold mt-4 transition duration-300"
              onClick={handleAddToWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ➕ Add to Wishlist
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
