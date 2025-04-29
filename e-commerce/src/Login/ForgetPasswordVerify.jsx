import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export function ForgetPasswordVerify() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("Number");

  //define generate captcha before it is being used
  const generateCaptcha = useCallback(() => {
    if (mode === "Number") {
      const num1 = Math.floor(Math.random() * 20);
      const num2 = Math.floor(Math.random() * 50);
      return {
        question: `${num1} * ${num2}   = ?`,
        answer: num1 * num2,
      };
    }

    if (mode === "Letter") {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let captcha = "";

      for (let index = 0; index < 5; index++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        captcha += characters[randomIndex];
      }
      return {
        question: captcha,
        answer: captcha,
      };
    }
  }, [mode]);

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");

  //changes captcha whenever the mode changes
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, [mode, generateCaptcha]);

  //verify email and username are in databases
  const resetPassword = async (userType) => {
    if (!email) {
      alert("Please enter a email associated with your username");
    }
    if (!username) {
      alert("Please enter your username");
    }
    if (mode === "Number") {
      if (parseInt(userCaptcha) !== captcha.answer) {
        alert("Incorrect CAPTCHA, try again!");
        setCaptcha(generateCaptcha());
        setUserCaptcha("");
        return;
      }
    }
    if (mode === "Letter") {
      if (userCaptcha !== captcha.answer) {
        alert("Incorrect CAPTCHA, try again!");
        setCaptcha(generateCaptcha());
        setUserCaptcha("");
        return;
      }
    }
    const link =
      userType === "Customer"
        ? "http://localhost:8000/check_customer_email"
        : "http://localhost:8000/check_seller_email";

    try {
      const response = await fetch(link, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(
          data.message ||
            "User with this email does not exist, please try again"
        );
        return;
      }
      alert("Proceeding with resetting password");
      navigate("/resetPassword", { state: { username, email, userType } });
    } catch (error) {
      console.error("Error", error);
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
        onClick={() => navigate("/Login")}
      >
        Back
      </button>
      <center>
        <h1 className="text-4xl mb-4 font-bold text-blue-600 drop-shadow-lg animate-pulse">
          Forget password
        </h1>
        <p></p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 space-y-6"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-bold text-gray-700 text-left">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-bold text-gray-700 text-left">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Type your username"
            />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-700">
              CAPTCHA: {captcha.question}
            </p>
            <p className="text-sm text-gray-500">
              Please solve the above captcha in the box below:
            </p>
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setMode("Number")}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
            >
              Number Captcha
            </button>
            <button
              onClick={() => setMode("Letter")}
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
            >
              Letter Captcha
            </button>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-bold text-gray-700 text-left">
              Solve Captcha
            </label>
            <input
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300 hover:shadow-md"
              placeholder="Enter captcha answer"
            />
          </div>
          <motion.button
            onClick={() => {
              resetPassword("Customer");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors"
          >
            Forget password as customer
          </motion.button>
          <motion.button
            onClick={() => {
              resetPassword("Seller");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-md hover:bg-blue-600 transition-colors"
          >
            Forget password as seller
          </motion.button>
        </motion.div>
      </center>
    </div>
  );
}
