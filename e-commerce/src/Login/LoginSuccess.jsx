import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";

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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <div>
          Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
          <span style={{ color: "purple" }}>{userType}</span>)
          <div>
            {userType === "customer" ? (
              <span style={{ color: "green" }}>&nbsp;Coins: {coins}💰</span>
            ) : null}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <FaBell
            size={24}
            style={{ cursor: "pointer" }}
            onClick={handleBellClick}
            color={bellColor}
          />
          {notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "red",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {notifications.length}
            </span>
          )}
          {userType === "seller" && showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: "10px",
                background: "white",
                border: "1px solid black",
                padding: "10px",
                borderRadius: "5px",
                minWidth: "500px",
              }}
            >
              {" "}
              {(() => {
                let notificationList = [];
                if (notifications.length > 0) {
                  for (let index = 0; index < notifications.length; index++) {
                    notificationList.push(
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <span>
                          Customer{" "}
                          <strong>{notifications[index].customer_name}</strong>{" "}
                          ordered{" "}
                          <strong>{notifications[index].item_name}</strong> on{" "}
                          <strong>
                            {new Date(
                              notifications[index].order_date
                            ).toLocaleDateString("en-MY")}
                          </strong>
                        </span>
                        <button
                          onClick={() => setItemToRead(notifications[index].id)}
                        >
                          Done
                        </button>
                      </div>
                    );
                  }
                  return notificationList;
                } else {
                  return (
                    <p style={{ textAlign: "center", color: "gray" }}>
                      No new notifications
                    </p>
                  );
                }
              })()}
            </div>
          )}
          {userType === "customer" && showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: "10px",
                background: "white",
                border: "1px solid black",
                padding: "10px",
                borderRadius: "5px",
                minWidth: "1000px",
              }}
            >
              {" "}
              {(() => {
                let notificationList = [];
                if (notifications.length > 0) {
                  for (let index = 0; index < notifications.length; index++) {
                    notificationList.push(
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <span>
                          Order{" "}
                          <strong>{notifications[index].product_name}</strong>{" "}
                          refunded for reason of{" "}
                          <strong>{notifications[index].refund_reason}</strong>{" "}
                          has been{" "}
                          <strong>
                            {notifications[index].request_for_refund}
                          </strong>
                        </span>
                        <button
                          onClick={() => setItemToRead(notifications[index].id)}
                        >
                          Noted
                        </button>
                      </div>
                    );
                  }
                  return notificationList;
                } else {
                  return (
                    <p style={{ textAlign: "center", color: "gray" }}>
                      No new notifications
                    </p>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>
      <div
        style={{ cursor: "pointer", fontSize: "40px" }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "120px",
            padding: "10px",
            border: "1px solid black",
            borderRadius: "5px",
            background: "white",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {userType === "seller" && (
              <>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "green" }}
                  onClick={() => {
                    navigate("/SellItems", {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  Sell Item
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "purple" }}
                  onClick={() => {
                    navigate("/AddStock", {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  Add Stock
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "orange" }}
                  onClick={() => {
                    navigate("/StockFlow", {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  StockFlow
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                  onClick={() => {
                    navigate("/MyItems", {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  My items
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "black" }}
                  onClick={() => {
                    navigate("/CustomerRefund", {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  Customer refund
                </li>
              </>
            )}
            {userType === "customer" && (
              <>
                <li
                  style={{
                    padding: "5px",
                    cursor: "pointer",
                    color: "brown",
                  }}
                  onClick={() =>
                    navigate("/Profile", {
                      state: { userType, username, userID },
                    })
                  }
                >
                  My Profile
                </li>
                <li
                  style={{
                    padding: "5px",
                    cursor: "pointer",
                    color: "Dark Gray",
                  }}
                  onClick={() =>
                    navigate("/WishlistTable", {
                      state: { userType, username, userID },
                    })
                  }
                >
                  My wishlist
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "green" }}
                  onClick={() =>
                    navigate("/Orders", {
                      state: { userType, username, userID },
                    })
                  }
                >
                  Orders
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                  onClick={() =>
                    navigate("/RefundTable", {
                      state: { userType, username, userID },
                    })
                  }
                >
                  Previous Refund
                </li>
                <li
                  style={{ padding: "5px", cursor: "pointer", color: "purple" }}
                  onClick={() =>
                    navigate("/DailyLogin", {
                      state: { userType, username, userID },
                    })
                  }
                >
                  DailyLogin
                </li>
              </>
            )}
            <li
              style={{ padding: "5px", cursor: "pointer", color: "red" }}
              onClick={() => navigate("/")}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
      <center>
        <p></p>
        Search for your item here: &nbsp;
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        ></input>{" "}
        &nbsp;
        <button onClick={handleSearch}>Search</button>
        <h1>Trending items</h1>
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
              <th style={{ border: "1px solid black" }}>Price(RM)</th>
              <th style={{ border: "1px solid black" }}>
                User Interest (Clicks)
              </th>
              <th style={{ border: "1px solid black" }}>
                Average User Ratings
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td
                  style={{ border: "1px solid black", cursor: "pointer" }}
                  onClick={() => {
                    increaseClickCount(item.id);
                    navigate(`/product/${item.id}`, {
                      state: { username, userType, userID },
                    });
                  }}
                >
                  <span style={{ textDecoration: "none", color: "black" }}>
                    {" "}
                    {item.name}
                  </span>
                </td>
                <td style={{ border: "1px solid black" }}>
                  RM
                  {Number(item.price).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={{ border: "1px solid black" }}>{item.clicked}</td>
                <td style={{ border: "1px solid black" }}>
                  {!averageRate[item.id] || isNaN(averageRate[item.id])
                    ? 0
                    : Number(averageRate[item.id]).toFixed(1)}
                  &nbsp;stars
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Search Results:</h2>
        {searchResults.length > 0 ? (
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
                <th style={{ border: "1px solid black" }}>Price (RM)</th>
                <th style={{ border: "1px solid black" }}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{ border: "1px solid black", cursor: "pointer" }}
                    onClick={() => {
                      increaseClickCount(item.id);
                      navigate(`/product/${item.id}`, {
                        state: { username, userType, userID },
                      });
                    }}
                  >
                    <span style={{ textDecoration: "none", color: "black" }}>
                      {item.name}
                    </span>
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    RM
                    {Number(item.price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ border: "1px solid black" }}>{item.clicked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </center>
    </div>
  );
}
