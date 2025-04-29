import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

export function Refund() {
  const location = useLocation();
  const { username, userType, userID, item } = location.state || {};
  const navigate = useNavigate();
  const [refundReason, setRefundReason] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateRefundReason() {
    try {
      const response = await fetch(
        "http://localhost:8000/update_refund_reason",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refund_reason: refundReason,
            refund_image: imageUrl,
            id: item.id,
          }),
        }
      );
      if (response.ok) {
        alert(
          "Refund request has been sent to seller. Awaiting approval from seller."
        );
        navigate("/Orders", { state: { username, userType, userID } });
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //upload image
  async function handleUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      setError("No file has been selected. Please select a file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size is too large, please attach smaller image.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError(
        "File type is incorrect. Please attach file of type JPEG or PNG only."
      );
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce");

    try {
      const response = await fetch(
        "http://api.cloudinary.com/v1_1/dz6b6ajwi/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setImageUrl(data.secure_url);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading image");
    } finally {
      setLoading(false);
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
      <div className="flex flex-col gap-6 items-center p-6">
        <div className="text-3xl text-blue-500 font-bold animate-pulse">
          Requesting for Refund
        </div>

        <motion.div
          className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl flex flex-col gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        >
          <img
            src={item.product_images}
            alt={item.product_name}
            className="w-48 h-48 object-cover rounded-lg self-center"
          />

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                Product Name:
              </span>
              <span className="text-gray-600">{item.product_name}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                Price per Item (RM):
              </span>
              <input
                value={Number(item.price).toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
                disabled
                className="bg-white text-gray-600 rounded-md px-4 py-2 border border-gray-300 w-40 text-center"
              />
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                Quantity Bought:
              </span>
              <span className="text-gray-600">{item.quantity}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                Discount from Coins (RM):
              </span>
              <span className="text-gray-600">
                {Number(item.discount_from_coins).toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                Total Sum Paid (RM):
              </span>
              <span className="text-gray-600">
                {(Number(item.price) * Number(item.quantity)).toLocaleString(
                  "en-MY",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Reason for Refund:
            </label>
            <motion.textarea
              className="w-full h-32 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Explain your reason..."
              whileHover={{
                boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)",
              }}
            ></motion.textarea>
          </div>

          <div className="flex flex-col gap-4">
            <label className="block font-semibold text-gray-700">
              Upload Proof (optional):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="text-gray-600"
            />

            {loading && (
              <p className="text-blue-400 animate-pulse">Uploading...</p>
            )}
            {error && <p className="text-red-500">{error}</p>}

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded Proof"
                className="w-72 h-auto object-cover rounded-lg self-center"
              />
            )}
          </div>

          <motion.button
            onClick={updateRefundReason}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white text-lg font-semibold transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            whileHover={{ scale: 1.1 }}
          >
            {loading ? "Processing..." : "Submit Refund Request"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
