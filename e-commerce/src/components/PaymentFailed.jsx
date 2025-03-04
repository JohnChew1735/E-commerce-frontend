import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function PaymentFailed() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const location = useLocation();
  const { pendingPaymentArray } = location.state || {};

  //debug
  useEffect(() => {
    console.log("In payment failed page", pendingPaymentArray);
  }, [pendingPaymentArray]);

  //getting user data stored in local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    // ✅ Redirect Logic
    const timer = setTimeout(() => {
      if (storedUser) {
        navigate("/LoginSuccess", { state: JSON.parse(storedUser) });
      } else {
        navigate("/"); // Redirect to home if userData is not found
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, sessionId]);

  //debug
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  //setting pendingPaymentOrderID to abandoned
  useEffect(() => {
    async function settingPendingPaymentToAdandoned() {
      try {
        const response = await fetch(
          "http://localhost:8000/set_pending_payment_to_abandoned",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderIDs: pendingPaymentArray,
            }),
          }
        );
        if (response.ok) {
          console.log("Pending payment orders set to abandoned.");
        }
      } catch (error) {
        console.error("Error setting pending payment to abandoned", error);
      }
    }
    settingPendingPaymentToAdandoned();
  }, [pendingPaymentArray]);

  return <div>Payment failed. Redirecting...</div>;
}
