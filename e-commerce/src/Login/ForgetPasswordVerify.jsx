import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

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
    console.log(mode);
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
      <button
        onClick={() => {
          navigate("/Login");
        }}
      >
        Back
      </button>
      <center>
        <h1>Forget password</h1>
        <p></p>
        Email:
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          tye="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        ></input>
        <p></p>
        Username: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <p></p>
        <p>CAPTCHA: {captcha.question}</p>
        Please solve the above captcha in the box below
        <p></p>
        <button
          onClick={() => {
            setMode("Number");
          }}
        >
          {" "}
          Number captcha
        </button>
        &nbsp;&nbsp;&nbsp;
        <button
          onClick={() => {
            setMode("Letter");
          }}
        >
          {" "}
          Letter captcha
        </button>
        <p></p>
        Captcha: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input
          value={userCaptcha}
          onChange={(e) => setUserCaptcha(e.target.value)}
        />
        <p></p>
        <button
          onClick={() => {
            resetPassword("Customer");
          }}
        >
          Forget password for existing customer
        </button>{" "}
        &nbsp;
        <button
          onClick={() => {
            resetPassword("Seller");
          }}
        >
          Forget password for existing seller
        </button>
        <p></p>
      </center>
    </div>
  );
}
