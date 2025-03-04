import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function PaymentSuccess() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const storedPaymentIntent = localStorage.getItem("paymentIntent");
  const paymentIntent = storedPaymentIntent;

  const paymentStatus = queryParams.get("redirect_status");
  const navigate = useNavigate();
  const userData = useMemo(() => {
    return JSON.parse(localStorage.getItem("userData")) || {};
  }, []);

  useEffect(() => {
    if (paymentIntent && paymentStatus === "succeeded") {
      updatePaymentStatus(paymentIntent);
      console.log(paymentIntent);
    }
    // eslint-disable-next-line
  }, [paymentIntent, paymentStatus]);

  //debug
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  async function updatePaymentStatus(paymentIntent) {
    try {
      const response = await fetch(
        "http://localhost:8000/update-payment-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntent }),
        }
      );

      if (response.ok) {
        console.log("Payment status updated in the backend.");
        setTimeout(() => {
          navigate("/loginSuccess", {
            state: { username: userData.username, userType: userData.userType },
          });
        }, 3000);
      } else {
        console.error("Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error updating payment status", error);
    }
  }

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your purchase!</p>
      <p>Redirecting in just a moment...</p>
    </div>
  );
}
