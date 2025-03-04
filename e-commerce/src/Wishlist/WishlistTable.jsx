import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function WishlistTable() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, userType, userID } = location.state || {};
  const [myWishList, setMyWishList] = useState([]);
  const [myWishListFirstImage, setMyWishListFirstImage] = useState([]);
  const [myCoins, setMyCoins] = useState(0);

  //get coin details
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
          setMyCoins(data.data);
        }
      } catch (error) {
        console.error("Error getting coin details", error);
      }
    }
    getCoinDetails();
  }, [userID]);

  //get all wishlist based on userID
  useEffect(() => {
    async function getMyWishList() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_wishlist_based_on_userID",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMyWishList(data.data);
        }
      } catch (error) {
        console.error("Error getting wishlist", error);
      }
    }
    getMyWishList();
  }, [userID]);

  //converting images into correct format
  useEffect(() => {
    async function getMyWishListItemsImages() {
      let productImages = [];
      for (let index = 0; index < myWishList.length; index++) {
        const allImages = await JSON.parse(myWishList[index].images);
        productImages.push(allImages[0]);
      }
      setMyWishListFirstImage(productImages);
    }
    getMyWishListItemsImages();
  }, [myWishList]);

  //handling adding to cart from wishlist
  async function handleAddToCart(wishlistID, itemID, quantity, price) {
    if (myCoins === 0) {
      try {
        const updateWishlistResponse = await fetch(
          "http://localhost:8000/update_wishlist",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: wishlistID }),
          }
        );
        if (updateWishlistResponse.ok) {
          try {
            const addItemToCartResponse = await fetch(
              "http://localhost:8000/add_item_to_cart",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customer_id: userID,
                  item_id: itemID,
                  quantity: quantity,
                  price: price,
                  discount_from_coins: myCoins,
                }),
              }
            );
            if (addItemToCartResponse.ok) {
              alert(
                "Successfully adding item to cart and not using customer coins."
              );
              navigate("/Orders", {
                state: { username, userType, userID },
              });
            } else {
              console.log("Error adding item to cart.");
            }
          } catch (error) {
            console.error("Error adding item to cart", error);
          }
        }
      } catch (error) {
        console.error("Error updating wishlist table", error);
      }
    } else {
      const coinResponse = window.confirm(
        `You have ${myCoins} coins. Do you want to use the coins for discount?`
      );
      if (coinResponse) {
        alert("Using coins for additional discount.");
        try {
          const updateWishlistResponse = await fetch(
            "http://localhost:8000/update_wishlist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: wishlistID }),
            }
          );
          if (updateWishlistResponse.ok) {
            try {
              const addItemToCartResponse = await fetch(
                "http://localhost:8000/add_item_to_cart",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer_id: userID,
                    item_id: itemID,
                    quantity: quantity,
                    price: price,
                    discount_from_coins: myCoins,
                  }),
                }
              );
              if (addItemToCartResponse.ok) {
                try {
                  const reducingCoinsResponse = await fetch(
                    "http://localhost:8000/reduce_customer_coins",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: userID }),
                    }
                  );
                  if (reducingCoinsResponse.ok) {
                    alert(
                      "Successfully added item to cart and using coins for discount."
                    );
                    navigate("/Orders", {
                      state: { username, userType, userID },
                    });
                  } else {
                    console.log(
                      "Error adding item to cart and error reducing customer coins."
                    );
                  }
                } catch (error) {
                  console.error("Error reducing customer coin.", error);
                }
              }
            } catch (error) {
              console.error("Error adding item to cart", error);
            }
          }
        } catch (error) {
          console.error("Error updating wishlist table", error);
        }
      } else {
        alert("Not using coins for additional discount.");
        try {
          const updateWishlistResponse = await fetch(
            "http://localhost:8000/update_wishlist",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: wishlistID }),
            }
          );
          if (updateWishlistResponse.ok) {
            try {
              const addItemToCartResponse = await fetch(
                "http://localhost:8000/add_item_to_cart",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customer_id: userID,
                    item_id: itemID,
                    quantity: quantity,
                    price: price,
                    discount_from_coins: myCoins,
                  }),
                }
              );
              if (addItemToCartResponse.ok) {
                alert(
                  "Successfully adding item to cart and not using customer coins."
                );
                navigate("/Orders", {
                  state: { username, userType, userID },
                });
              } else {
                console.log("Error adding item to cart.");
              }
            } catch (error) {
              console.error("Error adding item to cart", error);
            }
          }
        } catch (error) {
          console.error("Error updating wishlist table", error);
        }
      }
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
        <h1>My Wishlist Table</h1>
        <table
          style={{
            width: "80%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <td style={{ border: "1px solid black" }}></td>
              <td style={{ border: "1px solid black" }}>Product Name</td>
              <td style={{ border: "1px solid black" }}>Quantity</td>
              <td style={{ border: "1px solid black" }}>Price per item</td>
              <td style={{ border: "1px solid black" }}>Total price</td>
              <td style={{ border: "1px solid black" }}>Item note</td>
              <td style={{ border: "1px solid black" }}>Created at(Date)</td>
              <td style={{ border: "1px solid black" }}>Created at(Time)</td>
              <td style={{ border: "1px solid black" }}>Created at(Time)</td>
              <td style={{ border: "1px solid black" }}>Action</td>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let productWishlist = [];
              for (let index = 0; index < myWishList.length; index++) {
                productWishlist.push(
                  <tr key={index}>
                    <td style={{ border: "1px solid black" }}>
                      <img
                        src={myWishListFirstImage[index]}
                        alt={myWishList[index].name}
                        style={{
                          height: "100px",
                          width: "100px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          navigate(`/product/${myWishList[index].item_id}`, {
                            state: { username, userType, userID },
                          });
                        }}
                      ></img>
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                        cursor: "pointer",
                        color: "blue",
                        fontSize: "20px",
                      }}
                      onClick={() => {
                        navigate(`/product/${myWishList[index].item_id}`, {
                          state: { username, userType, userID },
                        });
                      }}
                    >
                      <strong>{myWishList[index].name}</strong>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {myWishList[index].quantity}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {Number(myWishList[index].price).toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {(
                        Number(myWishList[index].price) *
                        Number(myWishList[index].quantity)
                      ).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      <textarea
                        value={myWishList[index].note}
                        style={{ width: "160px", height: "82px" }}
                        disabled
                      ></textarea>
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(
                        myWishList[index].created_at
                      ).toLocaleDateString("en-MY")}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {new Date(
                        myWishList[index].created_at
                      ).toLocaleTimeString("en-MY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {myWishList[index].status === "active"
                        ? "🛒 In Wishlist"
                        : "✅ Purchased"}
                    </td>
                    <td style={{ border: "1px solid black" }}>
                      {myWishList[index].status === "added to cart" ? (
                        <button
                          style={{
                            height: "50px",
                            width: "120px",
                            fontSize: "17px",
                            color: "grey",
                            backgroundColor: "gold",
                            borderRadius: "10px",
                          }}
                          disabled
                        >
                          Added to cart
                        </button>
                      ) : myWishList[index].status === "active" ? (
                        <button
                          style={{
                            height: "50px",
                            width: "120px",
                            fontSize: "17px",
                            color: "white",
                            backgroundColor: "green",
                            borderRadius: "10px",
                          }}
                          onClick={() =>
                            handleAddToCart(
                              myWishList[index].wishlistID,
                              myWishList[index].item_id,
                              myWishList[index].quantity,
                              myWishList[index].price
                            )
                          }
                        >
                          Add To Cart
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              }
              return productWishlist;
            })()}
          </tbody>
        </table>
      </center>
    </div>
  );
}
