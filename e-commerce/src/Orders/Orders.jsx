import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrder, setPendingOrder] = useState("");
  const [completedOrder, setCompletedOrder] = useState("");
  const { username, userType, userID } = location.state || {};

  //get all pending orders
  useEffect(() => {
    const getPendingOrderDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_pending_order_details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPendingOrder(data.data);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    getPendingOrderDetails();
  }, [userID]);

  //checkout function
  async function checkout() {
    try {
      localStorage.setItem(
        "userData",
        JSON.stringify({ username, userID, userType })
      );
      const checkoutResponse = await fetch("http://localhost:8000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });

      if (!checkoutResponse.ok) {
        alert("User order not checked out");
        return;
      }
      navigate("/PaymentPage", { state: { username, userType, userID } });
    } catch (error) {
      console.error("Error during checkout", error);
    }
  }

  //get completed orders
  useEffect(() => {
    const getCompletedOrderDetails = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_completed_order_details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCompletedOrder(data.data);
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    getCompletedOrderDetails();
  }, [userID]);

  //allow user to delete order and add back the coins
  const deleteOrder = async (orderID, coinsUsed) => {
    if (coinsUsed > 0) {
      try {
        const response = await fetch(
          "http://localhost:8000/increase_customer_coins_more_than_10coins",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID, coinsUsed }),
          }
        );
        console.log(userID, coinsUsed);
        if (response.ok) {
          try {
            const response = await fetch(
              "http://localhost:8000/delete_orders",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, orderID }),
              }
            );
            if (response.ok) {
              alert("Order deleted");
            } else {
              alert("Order not deleted");
            }
          } catch (error) {
            console.error("Error deleting order", error);
          }
        }
      } catch (error) {
        console.error("Error increasing customer coins", error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:8000/delete_orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID, orderID }),
        });
        if (response.ok) {
          alert("Order deleted");
        } else {
          alert("Order not deleted");
        }
      } catch (error) {
        console.error("Error deleting order", error);
      }
    }
  };

  return (
    <div>
      <p>
        Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
        <span style={{ color: "purple" }}>{userType}</span>)
      </p>
      <button
        onClick={() => {
          navigate("/loginSuccess", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <center>
        <h1>Item in my cart</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black" }}>Name</th>
              <th style={{ border: "1px solid black" }}>Quantity</th>
              <th style={{ border: "1px solid black" }}>Price per item (RM)</th>
              <th style={{ border: "1px solid black" }}>
                Discount from coins (RM)
              </th>
              <th style={{ border: "1px solid black" }}>Total sum(RM)</th>
              <th style={{ border: "1px solid black" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rows = [];
              if (pendingOrder.length > 0) {
                for (let index = 0; index < pendingOrder.length; index++) {
                  let item = pendingOrder[index];
                  rows.push(
                    <tr key={index}>
                      <td
                        style={{
                          border: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={item.product_images}
                          alt={item.product_name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                        {item.product_name}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {item.quantity}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {Number(item.price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {Number(item.discount_from_coins).toLocaleString(
                          "en-MY",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {(
                          Number(item.quantity) * Number(item.price) -
                          Number(item.discount_from_coins)
                        ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          onClick={() => {
                            deleteOrder(item.id, item.discount_from_coins);
                            navigate("/loginSuccess", {
                              state: { username, userType, userID },
                            });
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }
              } else {
                rows.push(
                  <tr key="no_orders">
                    <td colSpan="6" style={{ border: "1px solid black" }}>
                      {" "}
                      No pending orders found{" "}
                    </td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
        <p></p>
        <button
          onClick={() => {
            checkout();
          }}
        >
          Check out
        </button>
        <h1>Previous Orders</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}>
                <strong>Name</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Quantity</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Price per item(RM)</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Discount from coins (RM)</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Total sum(RM)</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Rating Status</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Rating Stars</strong>
              </td>
              <td style={{ border: "1px solid black" }}>
                <strong>Request for refund</strong>
              </td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rows = [];
              if (completedOrder.length > 0) {
                for (let index = 0; index < completedOrder.length; index++) {
                  let item = completedOrder[index];
                  rows.push(
                    <tr key={item.id}>
                      <td
                        style={{
                          border: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={item.product_images}
                          alt={item.product_name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                        {item.product_name}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {item.quantity}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {Number(item.price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {Number(item.discount_from_coins).toLocaleString(
                          "en-MY",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {(
                          Number(item.quantity) * Number(item.price) -
                          Number(item.discount_from_coins)
                        ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          style={{
                            backgroundColor:
                              item.rating === "Pending" ? "red" : "green",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                          onClick={
                            item.rating === "Pending"
                              ? () => {
                                  navigate("/Ratings", {
                                    state: {
                                      userID,
                                      username,
                                      userType,
                                      orderID: item.id,
                                      itemID: item.item_id,
                                    },
                                  });
                                }
                              : null
                          }
                        >
                          {item.rating}
                        </button>
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {item.user_rating}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {item.request_for_refund === "No" ? (
                          <button
                            style={{
                              backgroundColor: "orange",
                              borderRadius: "5px",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              padding: "5px 15px",
                            }}
                            onClick={() => {
                              navigate("/Refund", {
                                state: { username, userType, userID, item },
                              });
                            }}
                          >
                            Request for refund
                          </button>
                        ) : item.request_for_refund ===
                          "Yes, pending approval" ? (
                          <button
                            style={{
                              backgroundColor: "blue",
                              borderRadius: "5px",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              padding: "5px 15px",
                            }}
                          >
                            Pending approval
                          </button>
                        ) : item.request_for_refund === "Approved" ? (
                          <button
                            style={{
                              backgroundColor: "green",
                              borderRadius: "5px",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              padding: "5px 15px",
                              height: "50px",
                            }}
                          >
                            Approved
                          </button>
                        ) : item.request_for_refund === "Denied" ? (
                          <button
                            style={{
                              backgroundColor: "red",
                              borderRadius: "5px",
                              border: "none",
                              color: "white",
                              cursor: "pointer",
                              padding: "5px 15px",
                              height: "50px",
                            }}
                          >
                            Denied
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                }
              } else {
                rows.push(
                  <tr key="no-orders">
                    <td colSpan="8" style={{ border: "1px solid black" }}>
                      No completed orders found
                    </td>
                  </tr>
                );
              }

              return rows;
            })()}
          </tbody>
        </table>
      </center>
    </div>
  );
}
