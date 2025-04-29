import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //login customer and seller
  const loginUser = async (userType) => {
    if (username === "") {
      alert("Please enter a username");
      return;
    }
    if (password === "") {
      alert("Please enter a password");
      return;
    }

    const link =
      userType === "customer"
        ? "http://localhost:8000/check_customer_info"
        : "http://localhost:8000/check_seller_info";

    try {
      const response = await fetch(link, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        alert(`Login success`);
        navigate("/loginSuccess", { state: { username, userType, password } });
      } else {
        alert(`Login failed`);
        setUsername("");
        setPassword("");
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
          Login for existing users
        </p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto mt-10 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Welcome Back!</h2>
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Plese type your username"
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              loginUser("customer");
            }}
          >
            Log in as customer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              loginUser("seller");
            }}
          >
            Log in as seller
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              navigate("/ForgetPasswordVerify");
            }}
          >
            Forget password
          </motion.button>
        </motion.div>
      </center>
    </div>
  );
}
