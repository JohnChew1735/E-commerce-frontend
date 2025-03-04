import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { useLocation, useNavigate } from "react-router-dom";

const stripePromise = loadStripe(
  "pk_test_51QxO9xHF4uq2jEGvsglFbSizeLNiNIK3Zcf8SNBP4rCp4ifQd2OEgQ2oU3vKecqoixA409Ghv76TZQfD2bPW7nFu000eMhj22g"
);

export function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [clientSecretID, setClientSecretID] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const storedUserData = JSON.parse(localStorage.getItem("userData")) || {};
  const { username, userType, userID } = location.state || storedUserData;
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrder, setPendingOrder] = useState([]);

  //getting all pending payment order
  useEffect(() => {
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
          setPendingOrders(Array.isArray(data.data) ? data.data : []); // Ensure it's an array
        } else {
          setPendingOrders([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getAllPendingPaymentOrder();
  }, [userID, pendingOrder, setPendingOrder]);

  useEffect(() => {
    if (pendingOrders.length === 0) return;

    const totalAmount = pendingOrders.reduce(
      (sum, order) => sum + order.price * order.quantity,
      0
    );

    async function fetchPaymentIntent() {
      try {
        // Fetch existing payment intent first
        const checkResponse = await fetch(
          "http://localhost:8000/get-existing-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );

        const checkData = await checkResponse.json();

        if (checkData.clientSecret) {
          setClientSecret(checkData.clientSecret); // Use existing PaymentIntent
        }
        if (!checkData.clientSecret) {
          console.log("No existing PaymentIntent, creating new one...");

          const response = await fetch(
            "http://localhost:8000/create-payment-intent",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userID,
                amount: totalAmount * 100,
                currency: "myr",
              }),
            }
          );

          const data = await response.json();
          console.log("Client secret in the table:", data);
          setClientSecret(data.clientSecret);
          setClientSecretID(data.id);
        }
      } catch (error) {
        console.error("Error handling payment intent:", error);
      }
    }

    fetchPaymentIntent();
  }, [userID, pendingOrders]);
  const options = clientSecret ? { clientSecret } : null;

  async function setAllPendingPaymentToAbandoned() {
    try {
      const gettingAllPendingPaymentResponse = await fetch(
        "http://localhost:8000/get_all_payment_pending_orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        }
      );

      console.log("Response status:", gettingAllPendingPaymentResponse.status);
      const data = await gettingAllPendingPaymentResponse.json();
      setPendingOrders(data.data);
      let pendingOrderIDs = [];
      for (let i = 0; i < data.data.length; i++) {
        pendingOrderIDs.push(data.data[i].id);
      }
      try {
        const setAllPendingPaymentToAbandonedResponse = await fetch(
          "http://localhost:8000/set_pending_payment_to_abandoned",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderIDs: pendingOrderIDs }),
          }
        );
        if (setAllPendingPaymentToAbandonedResponse.ok) {
          console.log("Pending payment set to abandoned.");
          try {
            let stockUpdates = [];
            for (let i = 0; i < data.data.length; i++) {
              stockUpdates.push({
                item_id: data.data[i].item_id,
                amount: data.data[i].quantity,
                inOrOut: "In",
                customerID: userID,
              });
            }
            console.log(stockUpdates);
            const updateStockFlowResponse = await fetch(
              "http://localhost:8000/update_stock_flow_for_customer_for_payment_abandoned",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  stockUpdates,
                }),
              }
            );
            if (updateStockFlowResponse.ok) {
              console.log("Stockflow updated for payment abandoned items");
              try {
                let coins = [];
                for (let index = 0; index < data.data.length; index++) {
                  coins.push(data.data[index].discount_from_coins);
                }
                console.log("coins", coins);
                const total = coins.reduce((sum, coin) => sum + coin, 0);
                if (total > 0) {
                  const addCustomerCoinsResponse = await fetch(
                    "http://localhost:8000/increase_customer_coins_more_than_10coins",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        coinsUsed: total,
                        userID: userID,
                      }),
                    }
                  );
                  if (addCustomerCoinsResponse.ok) {
                    console.log("Customer coins added from abandoned payment.");
                    try {
                      let stockCountUpdate = [];
                      for (let index = 0; index < data.data.length; index++) {
                        stockCountUpdate.push({
                          amount: data.data[index].quantity,
                          item_id: data.data[index].item_id,
                        });
                      }
                      console.log(stockCountUpdate);
                      const addingStockCountResponse = await fetch(
                        "http://localhost:8000/increase_stockCount_for_payment_abandoned",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ stockCountUpdate }),
                        }
                      );
                      if (addingStockCountResponse.ok) {
                        console.log("Item stock count updated.");
                        navigate("/loginSuccess", {
                          state: { username, userType, userID },
                        });
                      } else {
                        console.log("Item stock count not updated.");
                      }
                    } catch (error) {
                      console.error(
                        "Error adding invetory back to each item",
                        error
                      );
                    }
                  } else {
                    console.log(
                      "Error adding customer coins from abandoned payment despite customer having coins"
                    );
                  }
                } else {
                  console.log(
                    "Customer did not use any coins during abandoned payment."
                  );
                  try {
                    let stockCountUpdate = [];
                    for (let index = 0; index < data.data.length; index++) {
                      stockCountUpdate.push({
                        amount: data.data[index].quantity,
                        item_id: data.data[index].item_id,
                      });
                    }
                    console.log(stockCountUpdate);
                    const addingStockCountResponse = await fetch(
                      "http://localhost:8000/increase_stockCount_for_payment_abandoned",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stockCountUpdate }),
                      }
                    );
                    if (addingStockCountResponse.ok) {
                      console.log("Item stock count updated.");
                      navigate("/loginSuccess", {
                        state: { username, userType, userID },
                      });
                    } else {
                      console.log("Item stock count not updated.");
                    }
                  } catch (error) {
                    console.error(
                      "Error adding invetory back to each item",
                      error
                    );
                  }
                }
              } catch (error) {
                console.error(
                  "Error increasing coins back to customer due to refund",
                  error
                );
              }
            } else {
              console.log("Stockflow not updated for payment abandoned items");
            }
          } catch (error) {
            console.error(
              "Error updating stock flow to show inventory increase from payment being abandoned."
            );
          }
        } else {
          console.log("Pending payment is not set to abandoned.");
        }
      } catch (error) {
        console.error(
          "Error setting pending payment status to abandoned.",
          error
        );
      }
    } catch (error) {
      console.error("Error fetching pending payment orders.", error);
    }
  }

  //debug
  useEffect(() => {
    console.log(pendingOrders);
  }, [pendingOrders]);

  //Warn user before leaving the page
  useEffect(() => {
    const handleBackNavigation = async (event) => {
      event.preventDefault();

      if (isProcessing) return;

      const confirmLeave = window.confirm("Are you sure you want to go back?");
      if (confirmLeave) {
        setIsProcessing(true);
        await setAllPendingPaymentToAbandoned();
        setIsProcessing(false);
      } else {
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [navigate, isProcessing]);

  //so that no warning
  useEffect(() => {
    console.log(username, userType);
  }, [username, userType]);

  //storing client secret in localstorage
  useEffect(() => {
    if (clientSecretID) {
      localStorage.setItem("paymentIntent", clientSecretID);
      console.log("Client Secret in local storage", clientSecretID);
    }
  }, [clientSecretID]);

  return (
    <>
      <center>
        <h2>Pending Orders</h2>
        {pendingOrders.length > 0 ? (
          <table
            style={{
              width: "60%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid black" }}>Item name</th>
                <th style={{ border: "1px solid black" }}>Quantity</th>
                <th style={{ border: "1px solid black" }}>Price</th>
                <th style={{ border: "1px solid black" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ border: "1px solid black" }}>
                    {order.product_name}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {order.quantity}
                  </td>
                  <td style={{ border: "1px solid black" }}>RM{order.price}</td>
                  <td style={{ border: "1px solid black" }}>
                    RM{(order.price * order.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No pending payments.</p>
        )}
      </center>
      <p></p>

      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p>Loading payment...</p>
      )}
    </>
  );
}
