import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
      <button onClick={() => navigate("/")}>Back</button>
      <center>
        <h1>Login for existing users</h1>
        <p></p>
        Username: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p></p>
        Password:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        &nbsp;
        <button onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "🙈 Hide" : "👁️ Show"}
        </button>
        <p></p>
        <button
          onClick={() => {
            loginUser("customer");
          }}
        >
          Login as existing customer
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            loginUser("seller");
          }}
        >
          Login as existing seller
        </button>
        <p></p>
        <button
          onClick={() => {
            navigate("/ForgetPasswordVerify");
          }}
        >
          Forget password
        </button>
      </center>
    </div>
  );
}
