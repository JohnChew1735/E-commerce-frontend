import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function MyItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);

  const { username, userType, userID } = location.state || {};

  //increase click count
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

  //get all items sold by seller
  useEffect(() => {
    const getMyItems = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_item_by_seller",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMyItems(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };

    getMyItems();
  }, [userID]);

  //debug
  useEffect(() => {
    console.log(myItems);
  }, [myItems]);

  //get item id
  async function getItemID(name, price) {
    try {
      const response = await fetch("http://localhost:8000/get_item_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          await deleteItems(data.data);
        } else {
          alert("Item ID not found");
        }
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //delete item based on id
  async function deleteItems(id) {
    console.log(id);
    try {
      const response = await fetch("http://localhost:8000/delete_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      console.log(response);
      if (response.ok) {
        alert("Item deleted");
        navigate("/LoginSuccess", { state: { username, userType, userID } });
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //get item id without the deleting function
  async function getItemIDWithoutDelete(name, price) {
    try {
      const response = await fetch("http://localhost:8000/get_item_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          const itemID = data.data;
          return itemID;
        } else {
          alert("Item ID not found");
        }
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

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
        <h1>My items</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black" }}>Product Name</th>
              <th style={{ border: "1px solid black" }}>Product Price (RM)</th>
              <th style={{ border: "1px solid black" }}>Stock Count</th>
              <th style={{ border: "1px solid black" }}>Action</th>
              <th style={{ border: "1px solid black" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rows = [];
              if (myItems.length > 0) {
                for (let index = 0; index < myItems.length; index++) {
                  rows.push(
                    <tr key={index}>
                      <td
                        style={{ border: "1px solid black", cursor: "pointer" }}
                        onClick={() => {
                          increaseClickCount(myItems[index].id);
                          navigate(`/product/${myItems[index].id}`, {
                            state: { username, userType, userID },
                          });
                        }}
                      >
                        {myItems[index].name}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        RM
                        {Number(myItems[index].price).toLocaleString("en-MY", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        {myItems[index].stockCount}
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          style={{
                            backgroundColor: "red",
                            borderRadius: "5px",
                            border: "none",
                            padding: "5px",
                            color: "white",
                          }}
                          onClick={() => {
                            const response = window.confirm(
                              "Are you sure you want to delete this item?"
                            );
                            if (response) {
                              getItemID(
                                myItems[index].name,
                                myItems[index].price
                              );
                            } else {
                              return;
                            }
                          }}
                        >
                          Remove from the market
                        </button>
                      </td>
                      <td style={{ border: "1px solid black" }}>
                        <button
                          style={{
                            backgroundColor: "green",
                            borderRadius: "5px",
                            border: "none",
                            padding: "5px",
                            color: "white",
                          }}
                          onClick={async () => {
                            try {
                              const finalItemID = await getItemIDWithoutDelete(
                                myItems[index].name,
                                myItems[index].price
                              );

                              if (finalItemID) {
                                navigate("/EditItems", {
                                  state: {
                                    username,
                                    userType,
                                    userID,
                                    myItems,
                                    itemID: finalItemID,
                                  },
                                });
                              } else {
                                alert("Failed to fetch item ID");
                              }
                            } catch (error) {
                              console.error("Error fetching item ID:", error);
                            }
                          }}
                        >
                          Edit item
                        </button>
                      </td>
                    </tr>
                  );
                }
              }
              return rows;
            })()}
          </tbody>
        </table>
      </center>
    </div>
  );
}
