import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function DailyLogin() {
  const location = useLocation();
  const { username, userType, userID } = location.state || {};
  const navigate = useNavigate();
  const CLAIM_INTERVAL_TIME = 24 * 60 * 60 * 1000;
  const [timeLeft, setTimeLeft] = useState(0);

  //check if user can claim
  useEffect(() => {
    const lastClaim = localStorage.getItem("lastClaimTime");
    if (lastClaim) {
      const timeBetween = Number(Date.now()) - Number(lastClaim);
      const timeRemaining = CLAIM_INTERVAL_TIME - timeBetween;
      if (timeRemaining > 0) {
        setTimeLeft(timeRemaining);
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //create countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  //format time
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

  //handleclaim
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
        alert("You have successfully claimed your daily login reward.");
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
        {timeLeft > 0 ? (
          <p>
            Claim in &nbsp;
            {formatTime(timeLeft)}
          </p>
        ) : (
          <p>Daily login reward: 10 coins</p>
        )}

        <button onClick={handleClaim} disabled={timeLeft > 0}>
          {timeLeft > 0 ? "Please wait for next claim" : "Claim now"}
        </button>
      </center>
    </div>
  );
}
