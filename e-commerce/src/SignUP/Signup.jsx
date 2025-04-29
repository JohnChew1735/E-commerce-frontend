import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //adding new customer login details
  const addNewUser = async (userType) => {
    if (username === "") {
      alert("Please enter a username");
      return;
    }
    if (password === "") {
      alert("Please enter a password");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email");
      return;
    }
    const link =
      userType === "customer"
        ? "http://localhost:8000/create_new_customer"
        : "http://localhost:8000/create_new_seller";

    try {
      const response = await fetch(link, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      if (response.ok) {
        alert(`${username} has been added`);
        navigate("/");
      } else {
        alert(`${username} duplicate, please try another username`);
        setUsername("");
        setPassword("");
        setEmail("");
      }
    } catch (error) {
      console.error("Error", error);
      alert(`Server error, please try agin`);
    }
  };

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
          <button
            className="text-sm bg-white text-pink-500 px-2 py-1 rounded-full shadow-md font-medium animate-bounce"
            onClick={() => {
              navigate("/Login");
            }}
          >
            🎉 Big Deals!
          </button>
        </div>
      </div>

      <button
        className="text-sm font-semibold bg-pink-400 text-white px-4 py-1 rounded-full shadow hover:bg-pink-500 transition"
        onClick={() => navigate("/")}
      >
        Back
      </button>
      <center>
        <p className="text-4xl mb-4 font-bold text-green-600 drop-shadow-lg animate-pulse">
          Sign up for new users
        </p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-10 space-y-4"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Password</label>
            <div className="flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-xl hover:scale-110 transition-transform"
                title="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Enter your email"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-green-500 text-white font-bold rounded-md shadow-md hover:bg-green-600 transition-colors"
            onClick={() => {
              addNewUser("customer");
            }}
          >
            Sign up as Customer
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-purple-500 text-white font-bold rounded-md shadow-md hover:bg-purple-600 transition-colors"
            onClick={() => {
              addNewUser("seller");
            }}
          >
            Sign up as Seller
          </motion.button>
        </motion.div>
      </center>
    </div>
  );
}
