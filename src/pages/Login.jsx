import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();


  const handleLogin = () => {
    if (!email.endsWith("@vitstudent.ac.in")) {
      alert("Please use your VIT email ID");
      return;
    }

    // save user session
    localStorage.setItem("user", JSON.stringify({ email }));

    // redirect to home
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Enter your VIT email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;