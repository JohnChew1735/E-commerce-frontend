import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function CustomerRefund() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [refund, setRefund] = useState([]);

  //get customer refund request as seller
  useEffect(() => {
    async function getRefundRecord() {
      const response = await fetch(
        "http://localhost:8000/get_customer_refund_as_seller",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userID }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data.data);
        setRefund(data.data);
      }
    }
    getRefundRecord();
  }, [userID]);

  //setting the request to approved/denied
  async function setRequest(
    responseType,
    orderID,
    item_id,
    quantity,
    customer_id,
    coinsUsed
  ) {
    if (responseType === "Approved") {
      const userConfirm = window.confirm(
        "Are you sure about approving this customer refund?"
      );

      if (userConfirm) {
        try {
          const response = await fetch(
            "http://localhost:8000/increase_customer_coins_more_than_10coins",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userID: customer_id, coinsUsed }),
            }
          );
          if (response.ok) {
            try {
              const response = await fetch(
                "http://localhost:8000/set_request_for_refund_to_approved",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID }),
                }
              );
              if (response.ok) {
                console.log(orderID, item_id, quantity, customer_id);
                try {
                  const response = await fetch(
                    "http://localhost:8000/update_stock_flow_for_customer",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        item_id,
                        amount: quantity,
                        inOrOut: "In",
                        customerID: customer_id,
                      }),
                    }
                  );
                  if (response.ok) {
                    alert("Customer refund increased stock amount.");
                    window.location.reload();
                  }
                } catch (error) {
                  console.error(
                    "Error updating customer refund to increase stock quantity"
                  );
                }
              } else {
                alert("Customer refund request not updated");
              }
            } catch (error) {
              console.error("Error", error);
            }
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
    }
    if (responseType === "Denied") {
      const userConfirm = window.confirm(
        "Are you sure about denying this customer refund?"
      );
      if (userConfirm) {
        try {
          const response = await fetch(
            "http://localhost:8000/set_request_for_refund_to_denied",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID }),
            }
          );
          if (response.ok) {
            alert("Customer refund request denied");
            window.location.reload();
          } else {
            alert("Customer refund request not denied");
          }
        } catch (error) {
          console.error("Error", error);
        }
      }
    }
  }

  //debug
  useEffect(() => {
    console.log(refund);
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
        <p className="font-bold text-cyan-700 animate-pulse text-3xl">
          Customer Refund
        </p>
        <motion.div
          className="bg- white-100 p-6 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4">
            {(() => {
              let customerRefund = [];
              for (let index = 0; index < refund.length; index++) {
                customerRefund.push(
                  <motion.div
                    key={index}
                    className="border border-grey-100 shadow-lg rounded-lg"
                    whileHover={{
                      scale: 1.08,
                      boxShadow:
                        "0 0 30px rgba(59, 130, 246, 0.7), 0 0 40px rgba(59, 130, 246, 0.5)",
                    }}
                  >
                    <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col gap-5 px-4">
                      {/* Customer and Product Name Row */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <strong className="text-sm text-gray-600">
                            Customer:
                          </strong>
                          <div className="text-lg font-medium">
                            {refund[index].customer_name}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <strong className="text-sm text-gray-600">
                            Product:
                          </strong>
                          <div
                            className="text-blue-600 cursor-pointer underline"
                            onClick={() => {
                              navigate(`/product/${refund[index].item_id}`, {
                                state: { username, userID, userType },
                              });
                            }}
                          >
                            {refund[index].product_name}
                          </div>
                        </div>
                      </div>

                      {/* Price and Quantity Row */}
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <strong className="text-sm text-gray-600">
                            Price:
                          </strong>
                          <div className="text-lg font-medium">
                            RM{" "}
                            {Number(refund[index].price).toLocaleString(
                              "en-MY",
                              { minimumFractionDigits: 2 }
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <strong className="text-sm text-gray-600">
                            Quantity:
                          </strong>
                          <div className="text-lg font-medium">
                            {refund[index].quantity}
                          </div>
                        </div>
                      </div>

                      {/* Discount and Total Price Row */}
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <strong className="text-sm text-gray-600">
                            Discount from Coins:
                          </strong>
                          <div className="text-lg font-medium">
                            RM{" "}
                            {Number(
                              refund[index].discount_from_coins
                            ).toLocaleString("en-MY", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <strong className="text-sm text-gray-600">
                            Total Price:
                          </strong>
                          <div className="text-lg font-medium">
                            RM{" "}
                            {(
                              Number(refund[index].quantity) *
                                Number(refund[index].price) -
                              Number(refund[index].discount_from_coins)
                            ).toLocaleString("en-MY", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Order Date and User Rating Row */}
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <strong className="text-sm text-gray-600">
                            Order Date:
                          </strong>
                          <div className="text-lg font-medium">
                            {new Date(
                              refund[index].order_date
                            ).toLocaleDateString("en-MY", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <strong className="text-sm text-gray-600">
                            User Rating:
                          </strong>
                          <div className="text-lg font-medium">
                            {!refund[index].user_rating
                              ? "0.0"
                              : refund[index].user_rating}
                          </div>
                        </div>
                      </div>

                      {/* Refund Reason */}
                      <div className="flex flex-col">
                        <strong className="text-sm text-gray-600">
                          Refund Reason:
                        </strong>
                        <textarea
                          className="w-full h-20 border border-gray-300 rounded-md p-2 text-sm"
                          value={refund[index].refund_reason}
                          disabled
                        ></textarea>
                      </div>

                      {/* Refund Image */}
                      <div className="flex flex-col">
                        <strong className="text-sm text-gray-600">
                          Refund Image:
                        </strong>
                        {refund[index].refund_image ? (
                          <img
                            src={refund[index].refund_image}
                            alt={refund[index].product_name}
                            className="w-48 h-48 object-cover rounded-md"
                          />
                        ) : (
                          <p className="text-gray-500">
                            Customer did not attach any image
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between gap-4">
                        {refund[index].request_for_refund === "Approved" ? (
                          <button
                            className="bg-green-500 text-white py-2 px-4 rounded-md cursor-not-allowed"
                            disabled
                          >
                            Approved
                          </button>
                        ) : refund[index].request_for_refund === "Denied" ? (
                          <button
                            className="bg-red-500 text-white py-2 px-4 rounded-md cursor-not-allowed"
                            disabled
                          >
                            Denied
                          </button>
                        ) : (
                          <>
                            <button
                              className="bg-green-500 text-white py-2 px-4 rounded-md cursor-pointer"
                              onClick={() => {
                                setRequest(
                                  "Approved",
                                  refund[index].id,
                                  refund[index].item_id,
                                  refund[index].quantity,
                                  refund[index].customer_id,
                                  refund[index].discount_from_coins
                                );
                              }}
                            >
                              Approve
                            </button>
                            <button
                              className="bg-red-500 text-white py-2 px-4 rounded-md cursor-pointer"
                              onClick={() => {
                                setRequest("Denied", refund[index].id);
                              }}
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return customerRefund.length > 0 ? (
                customerRefund
              ) : (
                <div className="text-center text-gray-600 py-8">
                  No customer refund at the moment
                </div>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
