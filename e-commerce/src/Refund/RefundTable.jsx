import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function RefundTable() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [refund, setRefund] = useState([]);
  const [finalImage, setFinalImage] = useState([]);

  //get all refund record
  useEffect(() => {
    async function getRefundRecord() {
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
          setRefund(data.data);
        }
      } catch (error) {
        console.error("Error");
      }
    }
    getRefundRecord();
  }, [userID]);

  //converting images to proper format
  useEffect(() => {
    async function getProductImage() {
      if (refund.length > 0 && refund[0]?.product_images) {
        try {
          let imagesArray = [];
          for (let index = 0; index < refund.length; index++) {
            const product_images = await JSON.parse(
              refund[index].product_images
            );
            imagesArray.push(product_images[0]);
          }
          setFinalImage(imagesArray);
        } catch (error) {
          console.error("Error parsing product_images:", error);
        }
      }
    }
    getProductImage();
  }, [refund]);

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
        <h1 className="text-4xl font-bold text-cyan-600 drop-shadow-lg animate-pulse">
          Previous Refunds
        </h1>
        <div className="w-full max-w-4xl">
          {refund.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-lg rounded-2xl p-6 mb-6 border-l-8"
              style={{
                borderColor:
                  item.request_for_refund === "Approved"
                    ? "green"
                    : item.request_for_refund === "Denied"
                    ? "red"
                    : "orange",
              }}
            >
              <div className="flex items-center mb-4">
                <img
                  src={finalImage[index] || ""}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-md object-cover mr-4"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.product_name}</h2>
                  <p className="text-gray-500 text-sm">
                    {new Date(item.order_date).toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <strong>Discount from coins:</strong> RM{" "}
                  {Number(item.discount_from_coins).toLocaleString("en-MY", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <strong>Total paid:</strong> RM{" "}
                  {(
                    Number(item.price) * Number(item.quantity) -
                    Number(item.discount_from_coins)
                  ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="mb-4">
                <p>
                  <strong>Refund Reason:</strong>
                </p>
                <textarea
                  disabled
                  value={item.refund_reason}
                  className="w-full p-2 mt-2 border rounded-md resize-none"
                  rows="3"
                />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-4 py-2 rounded-full text-white cursor-not-allowed ${
                    item.request_for_refund === "Approved"
                      ? "bg-green-500"
                      : item.request_for_refund === "Denied"
                      ? "bg-red-500"
                      : "bg-orange-400"
                  }`}
                >
                  {item.request_for_refund}
                </span>

                {item.refund_image ? (
                  <img
                    src={item.refund_image}
                    alt="Refund Proof"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <p className="text-gray-400 italic">No image attached</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
