import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function Refund() {
  const location = useLocation();
  const { username, userType, userID, item } = location.state || {};
  const navigate = useNavigate();
  const [refundReason, setRefundReason] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateRefundReason() {
    try {
      const response = await fetch(
        "http://localhost:8000/update_refund_reason",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refund_reason: refundReason,
            refund_image: imageUrl,
            id: item.id,
          }),
        }
      );
      if (response.ok) {
        alert(
          "Refund request has been sent to seller. Awaiting approval from seller."
        );
        navigate("/Orders", { state: { username, userType, userID } });
      }
    } catch (error) {
      console.error("Error", error);
    }
  }

  //upload image
  async function handleUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      setError("No file has been selected. Please select a file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size is too large, please attach smaller image.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError(
        "File type is incorrect. Please attach file of type JPEG or PNG only."
      );
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce");

    try {
      const response = await fetch(
        "http://api.cloudinary.com/v1_1/dz6b6ajwi/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setImageUrl(data.secure_url);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading image");
    } finally {
      setLoading(false);
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
        <h1>Requesting for refund</h1>
        <div>
          <img
            style={{
              width: "200px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
            src={item.product_images}
            alt={item.product_name}
          ></img>
        </div>
        <div>
          Product name:&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;<input value={item.product_name} disabled></input>
        </div>
        <p></p>
        <div>
          Product price per item(RM):&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            value={Number(item.price).toLocaleString("en-MY", {
              minimumFractionDigits: 2,
            })}
            disabled
          ></input>
        </div>
        <p></p>
        <div>
          Quantity
          bought:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input value={item.quantity} disabled></input>
        </div>
        <p></p>
        <div>
          Discount from
          coins:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            value={Number(item.discount_from_coins).toLocaleString("en-MY", {
              minimumFractionDigits: 2,
            })}
            disabled
          ></input>
        </div>
        <p></p>
        <div>
          Total sum
          paid(RM):&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            value={(Number(item.price) * Number(item.quantity)).toLocaleString(
              "en-MY",
              {
                minimumFractionDigits: 2,
              }
            )}
            disabled
          ></input>
          <p></p>
          <strong>Please provide your reason for refund below:</strong>
          <p></p>
          <textarea
            style={{ width: "449px", height: "108px" }}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          ></textarea>
          <p></p>
          <input type="file" onChange={handleUpload} accept="image"></input>
          {loading && <p>Uploading</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p></p>
          {imageUrl && <img src={imageUrl} alt="Uploaded" width="300px"></img>}
          <p></p>
          <button onClick={() => updateRefundReason()} disabled={loading}>
            Request for refund
          </button>
        </div>
      </center>
    </div>
  );
}
