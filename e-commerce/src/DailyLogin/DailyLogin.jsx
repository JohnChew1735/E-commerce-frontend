import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export function DailyLogin() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const CLAIM_INTERVAL_TIME = 24 * 60 * 60 * 1000;
  const [timeLeft, setTimeLeft] = useState(0);
  const [claimed, setClaimed] = useState(false);

  // check if user can claim
  useEffect(() => {
    const lastClaim = localStorage.getItem("lastClaimTime");
    if (lastClaim) {
      const timeBetween = Number(Date.now()) - Number(lastClaim);
      const timeRemaining = CLAIM_INTERVAL_TIME - timeBetween;
      if (timeRemaining > 0) {
        setTimeLeft(timeRemaining);
      }
    }
  }, [CLAIM_INTERVAL_TIME]);

  // create countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // format time
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // handle claim
  async function handleClaim() {
    if (timeLeft > 0) return;
    try {
      const response = await fetch(
        "http://localhost:8000/increase_coin_for_customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID }),
        }
      );
      if (response.ok) {
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 },
        });
        alert("You have successfully claimed your daily login reward!");
        setClaimed(true);
        setTimeLeft(CLAIM_INTERVAL_TIME);
        localStorage.setItem("lastClaimTime", Number(Date.now()));
      }
    } catch (error) {
      console.error("Error", error);
      alert("Please try again later.");
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

      {/* Back Button */}
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
      <center className="mt-10">
        <motion.div>
          <motion.p
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60 }}
            className="text-4xl font-bold text-blue-600 drop-shadow-lg animate-pulse"
          >
            Daily Login
          </motion.p>
        </motion.div>
        <div className="mb-10"></div>
        <div className="text-lg font-semibold mb-5">
          {timeLeft > 0 ? (
            <>
              Claim in{" "}
              <span className="text-pink-600">{formatTime(timeLeft)}</span>
            </>
          ) : (
            <span className="text-green-600">
              Daily login reward: 10 coins!
            </span>
          )}
        </div>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6"
        >
          <img
            src={
              claimed
                ? "https://cdn-icons-png.flaticon.com/512/869/869636.png"
                : "https://cdn-icons-png.flaticon.com/512/869/869632.png"
            }
            alt="Treasure Chest"
            className="w-36 h-36 hover:scale-110 transition-transform duration-300"
          />
        </motion.div>
        <button
          onClick={handleClaim}
          disabled={timeLeft > 0}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            timeLeft > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-500 text-white"
          }`}
        >
          {claimed
            ? "Claimed!"
            : timeLeft > 0
            ? "Please wait..."
            : "Open the Chest!"}
        </button>
      </center>
    </div>
  );
}
