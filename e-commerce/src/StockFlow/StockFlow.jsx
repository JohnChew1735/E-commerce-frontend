import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function StockFlow() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [itemID, setItemID] = useState(0);
  const [itemStockFlow, setItemStockFlow] = useState([]);

  //get all items from the seller
  useEffect(() => {
    async function getAllItems() {
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
    }
    getAllItems();
  }, [userID]);

  //debug
  useEffect(() => {
    console.log(myItems);
  }, [myItems]);

  //get all stock flow based on product ID
  async function getStockFlow() {
    try {
      const response = await fetch("http://localhost:8000/get_all_stock_flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemID }),
      });

      if (response.ok) {
        const data = await response.json();
        setItemStockFlow(data.data);
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //calculate total stock left
  const totalStockLeft = (() => {
    let total = 0;
    for (let index = 0; index < itemStockFlow.length; index++) {
      if (itemStockFlow[index].inOrOut === "In") {
        total += itemStockFlow[index].amount;
      } else if (itemStockFlow[index].inOrOut === "Out") {
        total -= itemStockFlow[index].amount;
      }
    }
    return total;
  })();

  return (
    <div>
      <p>
        Logged in as: <strong style={{ color: "green" }}>{username}</strong> (
        <span style={{ color: "purple" }}>{userType}</span>)
      </p>
      <button
        onClick={() =>
          username || userType || userID
            ? navigate("/loginSuccess", {
                state: { username, userType, userID },
              })
            : navigate("/Home")
        }
      >
        Back
      </button>
      <center>
        <h1>Stock Movement</h1>
        <div>
          Select your product:&nbsp;&nbsp;
          <select onChange={(e) => setItemID(e.target.value)}>
            <option value={""}> Please select an option</option>
            {(() => {
              let options = [];
              for (let index = 0; index < myItems.length; index++) {
                options.push(
                  <option key={index} value={myItems[index].id}>
                    {myItems[index].name}
                  </option>
                );
              }
              return options;
            })()}
          </select>
          <p></p>
          <button
            onClick={() => {
              getStockFlow();
            }}
          >
            {" "}
            Get Stock Flow Details
          </button>
        </div>
        <h2>The below table will display the stock movement for the product</h2>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}>Date</td>
              <td style={{ border: "1px solid black" }}>Time</td>
              <td style={{ border: "1px solid black" }}>Amount</td>
              <td style={{ border: "1px solid black" }}>Product In/ Out</td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let productStockFlow = [];
              for (let index = 0; index < itemStockFlow.length; index++) {
                productStockFlow.push(
                  <tr key={index}>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(itemStockFlow[index].date).toLocaleDateString(
                        "en-MY"
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(itemStockFlow[index].date).toLocaleString(
                        "en-MY",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {itemStockFlow[index].inOrOut === "Out"
                        ? `(${itemStockFlow[index].amount})`
                        : itemStockFlow[index].amount}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {itemStockFlow[index].inOrOut}
                    </td>
                  </tr>
                );
              }
              return productStockFlow.length > 0 ? (
                productStockFlow
              ) : (
                <tr>
                  <td style={{ border: "1px solid black" }} colSpan="4">
                    {" "}
                    Nothing to show
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
        <p></p>
        <table
          style={{
            width: "20%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td>Stock Amount:</td>
              <td>
                {itemStockFlow.length > 0
                  ? `${totalStockLeft} stocks left`
                  : "No stock data available"}
              </td>
            </tr>
          </thead>
        </table>
      </center>
    </div>
  );
}
