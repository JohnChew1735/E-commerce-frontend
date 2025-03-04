import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
      <button onClick={() => navigate("/")}>Back</button>
      <center>
        <h1>Sign up for new users</h1>
        <p></p>
        Username: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <p></p>
        Password:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        &nbsp;
        <button
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        >
          {showPassword ? "🙈 Hide" : "👁️ Show"}
        </button>
        <p></p>
        Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <p></p>
        <button
          onClick={() => {
            addNewUser("customer");
          }}
        >
          Sign up as new customer
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            addNewUser("seller");
          }}
        >
          Sign up as new seller
        </button>
      </center>
    </div>
  );
}
