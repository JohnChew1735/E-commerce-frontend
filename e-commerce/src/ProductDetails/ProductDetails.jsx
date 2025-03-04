import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function ProductDetails() {
  const { id } = useParams();
  const [itemDetails, setItemDetails] = useState("");
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const [quantity, setQuantity] = useState(1);
  const [coins, setCoins] = useState(0 || null);
  const [useAllCoins, setUseAllCoins] = useState(false);
  const [customerFeedback, setCustomerFeedback] = useState([]);

  //get item details
  const getItemDetails = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:8000/get_product_details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
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
  };

  //get item details
  useEffect(() => {
    getItemDetails(id);
  }, [id]);

  const navigate = useNavigate();

  //control the quantity of product
  const increaseQuantity = () => {
    setQuantity(Number(quantity) + 1);
  };
  const decreaseQuantity = () => {
    setQuantity(quantity > 1 ? Number(quantity) - 1 : 1);
  };

  //add item to customer order table and include use coins for discount
  const addItemToCart = async () => {
    if (useAllCoins) {
      try {
        const response = await fetch("http://localhost:8000/add_item_to_cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: userID,
            item_id: itemDetails.id,
            quantity: quantity,
            price: itemDetails.price,
            discount_from_coins: coins,
          }),
        });
        if (response.ok) {
          try {
            const response = await fetch(
              "http://localhost:8000/reduce_customer_coins",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userID }),
              }
            );
            if (response.ok) {
              alert("Item added to the cart");
              navigate("/Orders", { state: { username, userType, userID } });
            }
          } catch (error) {
            console.error("Error reducing customer coins", error);
          }
        }
      } catch (error) {
        console.error("Error adding item to cart", error);
      }
    }
    if (!useAllCoins) {
      try {
        const response = await fetch("http://localhost:8000/add_item_to_cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: userID,
            item_id: itemDetails.id,
            quantity: quantity,
            price: itemDetails.price,
            discount_from_coins: 0,
          }),
        });
        if (response.ok) {
          alert("Item added to the cart");
          navigate("/Orders", { state: { username, userType, userID } });
        }
      } catch (error) {
        console.error("Error adding item to cart", error);
      }
    }
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
          const data = await response.json();
          setCoins(data.data);
        } else {
          setCoins(0);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getCoinDetails();
  }, [userID]);

  //get customer feedback
  useEffect(() => {
    async function getCustomerFeedback() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_customer_feedback_from_productID",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemDetails.id }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setCustomerFeedback(data.data);
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
    getCustomerFeedback();
  }, [itemDetails]);

  //debug
  useEffect(() => {
    console.log(customerFeedback);
  }, [customerFeedback]);

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
        <h1> {itemDetails?.name}</h1>
      </center>
      <h2>Product Images</h2>
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexwrap: "wrap",
        }}
      ></div>
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
      <div
        style={{
          display: "flex",
          gap: "800px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>Product video</h2>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {itemDetails.video?.split(",").map((video, index) => (
              <video
                key={index}
                src={video.trim()}
                controls
                style={{
                  width: "300px",
                  height: "200px",
                  borderRadius: "10px",
                }}
              />
            ))}
          </div>
          <h3>
            <strong>Price:</strong> &nbsp;RM
            {Number(itemDetails?.price).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
            &nbsp;&nbsp;&nbsp;
            {userType === "customer" ? (
              <>
                <button
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "5px 15px",
                  }}
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                &nbsp;
                <input
                  style={{ width: "60px", height: "30px", fontSize: "15px" }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                ></input>
                &nbsp;
                <button
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "5px 15px",
                  }}
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </>
            ) : null}
            &nbsp;&nbsp;&nbsp;&nbsp;
            {userType === "customer" ? (
              <button
                style={{
                  fontSize: "20px",
                  padding: "10px 20px",
                  color: "white",
                  backgroundColor: "green",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  const confirmAdd = window.confirm(
                    "Are you sure you want to add this item to the cart?"
                  );
                  if (confirmAdd) {
                    if (quantity < 1) {
                      alert(
                        "Item quantity cannot be less than 1. Please try again."
                      );
                      return;
                    }
                    if (itemDetails.stockCount - quantity < 0) {
                      alert(
                        `Please select according to the stock available, your maximum amount of which you can order this product is ${itemDetails.stockCount}`
                      );
                    } else {
                      const response = await addItemToCart();
                      if (response) {
                        alert("Item added to cart.");
                        navigate("/Orders", {
                          state: {
                            userType,
                            username,
                            userID,
                            itemDetails,
                            quantity,
                          },
                        });
                      }
                    }
                  }
                }}
              >
                Add to Cart
              </button>
            ) : null}
          </h3>
          {userType === "customer" ? (
            <div>
              <input
                type="checkbox"
                id="coinCheckbox"
                style={{ width: "25px", height: "25px" }}
                checked={useAllCoins}
                onChange={(e) => {
                  if (e.target.checked) {
                    const userConfirm = window.confirm(
                      "Each coin is RM1.00 discount on the product price. Are you sure you want to use all the coins for this purchase?"
                    );

                    if (userConfirm) {
                      setUseAllCoins(true);
                    } else {
                      setUseAllCoins(false);
                    }
                  } else {
                    setUseAllCoins(false);
                  }
                }}
              />
              <strong>
                <label htmlFor="coinCheckbox">
                  {" "}
                  Use all {coins} coins for discount
                </label>
              </strong>
            </div>
          ) : null}

          <h3>
            Stock Count:&nbsp;
            {itemDetails.stockCount ? itemDetails.stockCount : 0} stocks
            available
          </h3>
          {userType === "customer" ? (
            <button
              style={{
                width: "200px",
                height: "50px",
                fontSize: "20px",
                borderRadius: "5px",
                color: "white",
                backgroundColor: "green",
                cursor: "pointer",
              }}
              onClick={() => {
                navigate("/Wishlist", {
                  state: { username, userType, userID, itemDetails },
                });
              }}
            >
              Add to Wishlist
            </button>
          ) : null}
          <h4>Details:</h4>
          <ul>
            {itemDetails.description?.split("\n").map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>User comments</h3>
          <div
            style={{
              width: "400px",
              height: "400px",
              overflow: "auto",
              border: "1px solid black",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {customerFeedback.length > 0 ? (
              (() => {
                let feedbackArray = [];
                for (let index = 0; index < customerFeedback.length; index++) {
                  feedbackArray.push(
                    <div key={index}>
                      <strong>{customerFeedback[index].customerName}</strong>
                      <p></p>
                      <textarea
                        style={{ width: "387px", height: "31px" }}
                        value={customerFeedback[index].customer_feedback}
                        disabled
                      ></textarea>
                    </div>
                  );
                }
                return feedbackArray;
              })()
            ) : (
              <p>No user comment</p>
            )}
          </div>
        </div>
      </div>
      <p></p>
    </div>
  );
}
