import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { FaStar } from "react-icons/fa";

export function Ratings() {
  const [itemDetails, setItemDetails] = useState("");
  const location = useLocation();
  const { username, userType, userID, itemID, orderID } = location.state || {};
  const navigate = useNavigate();
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  //set item details function
  const getItemDetails = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/get_product_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: itemID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setItemDetails(data.details);
      } else {
        setItemDetails("No description found.");
      }
    } catch (error) {
      console.error("Error", error);
      setItemDetails("Error loading description.");
    }
  }, [itemID]);

  //debug
  useEffect(() => {
    console.log(rating);
  }, [rating]);

  // if item id exist, run the function to set item details
  useEffect(() => {
    if (itemID) {
      getItemDetails();
    }
  }, [itemID, getItemDetails]);

  //update product rating
  async function updateProductRating(rating, orderID) {
    try {
      const response = await fetch("http://localhost:8000/update_rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_rating: rating, id: orderID }),
      });
      if (response.ok) {
        alert("User ratings updated");
      } else {
        alert("User ratings not updated");
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  async function handleAddCustomerFeedback() {
    try {
      const response = await fetch(
        "http://localhost:8000/add_customer_feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemID,
            customer_id: userID,
            customerFeedback: feedback,
          }),
        }
      );
      if (response.ok) {
        console.log("User feedback added");
      } else {
        console.log("User feedback not added.");
      }
    } catch (error) {
      console.error("Error adding customer feedback");
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
          navigate("/Orders", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <center>
        <h1>Rate your item</h1>
        <h1>{itemDetails?.name}</h1>
        <h2>Product Images</h2>
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexwrap: "wrap",
          }}
        ></div>
      </center>
      {itemDetails.images &&
        (() => {
          try {
            const images = JSON.parse(itemDetails.images);
            return images.map((img, index) => (
              <img
                key={index}
                src={img.trim()}
                alt={`Product ${index + 1}`}
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            ));
          } catch (error) {
            console.error("Error parsing images JSON:", error);
            return <p>Error loading images</p>;
          }
        })()}

      <h3>
        <div style={{ display: "flex", gap: "5px" }}>
          {(() => {
            let stars = [];
            for (let index = 1; index < 6; index++) {
              stars.push(
                <span
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={() => setRating(index)}
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(rating)}
                >
                  <FaStar
                    size={30}
                    color={index <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  />
                </span>
              );
            }
            return stars;
          })()}
        </div>
        <p>Your Rating:&nbsp;{rating}&nbsp;Stars&nbsp;&nbsp;</p>
        <p></p>
        Price: &nbsp;RM
        {Number(itemDetails?.price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
      </h3>

      <h4>Details:</h4>
      <ul>
        {itemDetails.description?.split("\n").map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
      <p>Submit your feedback:</p>
      <textarea
        style={{ width: "500px", height: "200px" }}
        onChange={(e) => setFeedback(e.target.value)}
      ></textarea>
      <p></p>
      <button
        onClick={() => {
          updateProductRating(rating, orderID);
          handleAddCustomerFeedback();
          navigate("/loginSuccess", {
            state: { userID, username, userType },
          });
        }}
      >
        Submit feedback
      </button>
    </div>
  );
}
