import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, email, userType } = location.state || {};
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //change password for seller and customer
  const changePassword = async (userType) => {
    if (!password1 || !password2) {
      alert("Please enter a password");
    }
    if (password1 !== password2) {
      alert("Password do not match. Please try again.");
      return;
    }

    const link =
      userType === "Customer"
        ? "http://localhost:8000/change_customer_password"
        : "http://localhost:8000/change_seller_password";

    try {
      const response = await fetch(link, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password1 }),
      });
      if (response.ok) {
        alert("Password updated successfully");
        navigate("/");
      } else {
        alert("Password was not changed. Please try again.");
      }
    } catch (error) {
      console.error("Error", error);
      alert("An error occured, please try again.", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          navigate("/ForgetPasswordVerify");
        }}
      >
        Back
      </button>
      <center>
        <h1>Reset Password</h1>
        <p></p>
        Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input value={email} disabled></input>
        <p></p>
        Username: &nbsp;&nbsp;&nbsp;
        <input value={username} disabled></input>
        <h3>Please confirm your new password below:</h3>
        <p></p>
        Password:
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type={showPassword ? "text" : "password"}
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
        ></input>{" "}
        <p></p>
        Confirm your password: &nbsp;&nbsp;&nbsp;
        <input
          type={showPassword ? "text" : "password"}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        ></input>
        <p></p>
        <button onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "🙈 Hide" : "👁️ Show"}
        </button>{" "}
        &nbsp;
        <button
          onClick={() => {
            changePassword(userType);
          }}
        >
          Change password
        </button>
      </center>
    </div>
  );
}
