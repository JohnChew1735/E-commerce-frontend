import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState(null);

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
      <div className="bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 shadow-md py-4 px-6 flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Logo"
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">
            ShopSphere
          </h1>
          <button className="text-sm bg-white text-pink-500 px-2 py-1 rounded-full shadow-md font-medium animate-bounce">
            🎉 Big Deals!
          </button>
        </div>
        <div className="flex space-x-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <div>
              <span>Logged in as: </span>
              <strong className="text-blue-700">{username}</strong> (
              <span className="text-purple-500">{userType}</span>)
            </div>
          </motion.div>
        </div>
      </div>
      <button
        className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
        onClick={() => {
          navigate("/loginSuccess", {
            state: { username, userType, userID },
          });
        }}
      >
        Back
      </button>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-10 space-y-4"
      >
        <div className="flex flex-col items-center justify-center space-y-4 mt-6">
          <motion.p className="text-4xl font-bold text-orange-600 drop-shadow-lg animate-pulse">
            My Profile
          </motion.p>

          <div className="relative flex flex-col items-center gap-2">
            <p className="text-gray-700 font-medium">
              Current profile picture:
            </p>
            {imageUrl ? (
              <motion.img
                src={imageUrl}
                alt="Uploaded"
                className="w-[200px] h-[200px] rounded-md border border-black object-cover cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFullImageSrc(imageUrl);
                  setShowFullImage(true);
                }}
              />
            ) : (
              <motion.img
                src={userInfo.profileImage}
                alt={userInfo.username}
                className="w-[200px] h-[200px] rounded-md border border-black object-cover cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFullImageSrc(userInfo.profileImage);
                  setShowFullImage(true);
                }}
              />
            )}

            <label className="text-sm font-medium mt-2">
              New profile picture:
            </label>
            <input
              type="file"
              onChange={handleUpload}
              accept="image/*"
              className="cursor-pointer"
            />
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-blue-500">Uploading...</p>}
          </div>
          <div className="flex flex-col items-start gap-2">
            <label className="font-medium">
              Username:&nbsp;
              <input
                defaultValue={usernameInput}
                type="text"
                onFocus={() => setUsernameInput("")}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="border px-2 py-1 rounded-md"
              />
            </label>

            <label className="font-medium">
              Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                value={emailInput}
                type="text"
                onFocus={() => setEmailInput("")}
                onChange={(e) => setEmailInput(e.target.value)}
                className="border px-2 py-1 rounded-md"
              />
            </label>
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="font-medium">Password:&nbsp;</label>
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  className="border px-2 py-1 rounded-md"
                />
                &nbsp;
                <motion.button
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-sm text-blue-500"
                  whileHover={{ scale: 1.1 }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </motion.button>
              </div>
            </div>
          </div>
          <motion.button
            disabled={loading}
            onClick={handleChangeInformation}
            className="bg-orange-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-orange-600 transition-all disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Processing..." : "Update Information"}
          </motion.button>
        </div>
      </motion.div>
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={fullImageSrc}
            alt="Full View"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
