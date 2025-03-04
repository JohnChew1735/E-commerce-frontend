import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function Wishlist() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, userType, userID, itemDetails } = location.state || {};
  const [itemImage, setItemImage] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [itemNote, setItemNote] = useState("");

  //setting image to correct format
  useEffect(() => {
    const imagesArray = JSON.parse(itemDetails.images);
    setItemImage(imagesArray);
  }, [itemDetails]);

  //handle add to wishlist
  async function handleAddToWishlist() {
    try {
      const response = await fetch("http://localhost:8000/add_to_wishlist", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          item_id: itemDetails.id,
          customer_id: userID,
          quantity: quantity,
          note: itemNote,
        }),
      });
      if (response.ok) {
        alert("Wishlist added");
        navigate("/WishlistTable", { state: { username, userType, userID } });
      } else {
        alert("Wishlist not added.");
      }
    } catch (error) {
      console.error("Error adding to wishlist", error);
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
        <h1>Adding to wishlist</h1>
        {(() => {
          let finalItemImages = [];
          for (let index = 0; index < itemImage.length; index++) {
            finalItemImages.push(
              <img
                src={itemImage[index]}
                alt={itemDetails.name}
                style={{ width: "100px", height: "100px", borderRadius: "5px" }}
              ></img>
            );
          }
          return finalItemImages;
        })()}
        <p></p>
        Product name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input value={itemDetails.name} disabled></input>
        <p></p>
        Quantity:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type={"number"}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
          }}
        ></input>
        <p></p>
        <h2>
          <strong>Item note:</strong>
        </h2>
        <p></p>
        <textarea
          style={{ width: "325px", height: "134px", borderRadius: "5px" }}
          value={itemNote}
          onChange={(e) => setItemNote(e.target.value)}
        ></textarea>
        <p></p>
        <button
          style={{
            width: "130px",
            height: "30px",
            color: "white",
            backgroundColor: "green",
            borderRadius: "5px",
            fontSize: "16px",
          }}
          onClick={() => {
            handleAddToWishlist();
          }}
        >
          {" "}
          Add to wishlist
        </button>
      </center>
    </div>
  );
}
