import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function Profile() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [usernameInput, setUsernameInput] = useState(userInfo.username || "");
  const [emailInput, setEmailInput] = useState(userInfo.email || "");
  const [imageInput, setImageInput] = useState(userInfo.profileImage || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //handle image upload
  async function handleUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      setError("No file selected.");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size too large. Please attach something smaller.");
      return;
    }
    const validType = ["image/jpeg", "image/jpg", "image/png"];
    if (!validType.includes(file.type)) {
      setError("File type is incorrect. Please try again.");
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
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setError("Image uploading failed. Please try again.");
      }
    } catch (error) {
      console.error("Error", error);
      setError("Error uploding image");
    } finally {
      setLoading(false);
    }
  }

  //get customer information
  useEffect(() => {
    async function getCustomerInfo() {
      try {
        const response = await fetch(
          "http://localhost:8000/get_customer_information",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data[0]);
        } else {
          console.log("Customer information not acquired.");
        }
      } catch (error) {
        console.error("Error getting customer information", error);
      }
    }
    getCustomerInfo();
  }, [userID]);

  //set username input field
  useEffect(() => {
    if (userInfo.username) {
      setUsernameInput(userInfo.username);
    }
  }, [userInfo.username]);

  //set email input field
  useEffect(() => {
    if (userInfo.email) {
      setEmailInput(userInfo.email);
    }
  }, [userInfo.email]);

  //set image for user as previous image
  useEffect(() => {
    if (userInfo.profileImage) {
      setImageInput(userInfo.profileImage);
    }
  }, [userInfo.profileImage]);

  //handle change user information
  async function handleChangeInformation() {
    const newImageUrl = imageUrl || imageInput;
    const newUsername = usernameInput || userInfo.username;
    const newEmail = emailInput || userInfo.email;

    //email verification using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      alert("Invalid email format. Please enter a valid email.");
      return;
    }

    const updatedData = {
      profileImage: newImageUrl,
      username: newUsername,
      email: newEmail,
      id: userID,
    };

    if (newPassword) {
      updatedData.password = newPassword;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/update_customer_information",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (response.ok) {
        alert("User information updated successfully.");
        navigate("/loginSuccess", {
          state: { username: newUsername, userID, userType },
        });
      } else {
        alert("User information not updated. Please try again.");
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
        <h1>My Profile</h1>
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <h2>
            <strong>Current profile picture:</strong>
          </h2>
          <p></p>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{
                border: "1px solid black",
                borderRadius: "2px",
                width: "200px",
                height: "200px",
              }}
            ></img>
          ) : (
            <img
              src={userInfo.profileImage}
              alt={userInfo.username}
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid black",
                borderRadius: "5px",
              }}
            />
          )}
          <p></p> New profile picture: &nbsp;&nbsp;&nbsp;
          <input type={"file"} onChange={handleUpload} accept={"image"}></input>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {loading && <p> Uploading...</p>}
        </div>
        <p></p>
        Username: &nbsp;&nbsp;
        <input
          defaultValue={usernameInput}
          type={"text"}
          onFocus={() => setUsernameInput("")}
          onChange={(e) => setUsernameInput(e.target.value)}
        ></input>
        <p></p>
        Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          value={emailInput}
          type={"text"}
          onFocus={() => setEmailInput("")}
          onChange={(e) => setEmailInput(e.target.value)}
        ></input>
        <p></p>
        Password:&nbsp;&nbsp;&nbsp;
        <input
          type={showPassword ? "text" : "password"}
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
        ></input>
        &nbsp;
        <button onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "🙈 Hide" : "👁️ Show"}{" "}
        </button>
        <p></p>
        <button disabled={loading} onClick={() => handleChangeInformation()}>
          Update information
        </button>
      </center>
    </div>
  );
}
