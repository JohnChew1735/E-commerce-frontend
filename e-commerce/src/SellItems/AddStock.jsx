import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function AddStock() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const [myItems, setMyItems] = useState([]);
  const navigate = useNavigate();
  const [finalImages, setFinalImages] = useState("");
  const [stockAmount, setStockAmount] = useState(0);

  //get all items sold by the seller
  useEffect(() => {
    async function getAllItemsBySeller() {
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
    getAllItemsBySeller();
  }, [userID]);

  //convert image into correct format
  useEffect(() => {
    let imagesArray = [];
    for (let index = 0; index < myItems.length; index++) {
      const image = JSON.parse(myItems[index].images);
      imagesArray.push(image[0]);
    }
    setFinalImages(imagesArray);
  }, [myItems]);

  //add stock count function
  async function addStockCount(item_id, amount, userID) {
    try {
      const response = await fetch("http://localhost:8000/update_stock_flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id,
          amount,
          inOrOut: "In",
          sellerID: userID,
        }),
      });
      if (response.ok) {
        alert("Stock count for that inventory has been updated");
        window.location.reload();
      } else {
        alert(
          "Stock count for that inventory is not updated. Please check if the inventory amount is in correct format."
        );
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
        <h1>Add Items</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}>Product name</td>
              <td style={{ border: "1px solid black" }}>
                Product current stock
              </td>
              <td style={{ border: "1px solid black" }}>
                Stock amount to be added
              </td>
              <td style={{ border: "1px solid black" }}>Action</td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let productArray = [];
              for (let index = 0; index < myItems.length; index++) {
                productArray.push(
                  <tr key={index}>
                    <td
                      style={{
                        border: "1px solid black",
                        cursor: "pointer",
                        display: "flex",
                        alignContent: "center",
                        height: "50px",
                      }}
                    >
                      <img
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                        src={finalImages[index]}
                        alt={myItems[index].name}
                      ></img>
                      {myItems[index].name}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {myItems[index].stockCount}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <input
                        type="number"
                        value={myItems[index].stockAmount}
                        onChange={(e) => setStockAmount(e.target.value)}
                      ></input>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <button
                        style={{
                          cursor: "pointer",
                          color: "white",
                          backgroundColor: "orange",
                          borderRadius: "5px",
                          padding: "5px",
                        }}
                        onClick={() => {
                          addStockCount(myItems[index].id, stockAmount, userID);
                        }}
                      >
                        Add stock
                      </button>
                    </td>
                  </tr>
                );
              }
              return productArray;
            })()}
            <tr>
              <td></td>
            </tr>
          </tbody>
        </table>
      </center>
    </div>
  );
}
