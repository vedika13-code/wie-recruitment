import { useState } from "react"; // Hook for managing state
import { useNavigate } from "react-router-dom"; // Hook for navigation (routing)

function Login() { // Functional Component (represents Login page)

  // State: stores the email entered by user
  const [email, setEmail] = useState("");

  // Hook: used to navigate between routes/pages
  const navigate = useNavigate();


  // Event handling function (runs when Login button is clicked)
  const handleLogin = () => {

    // Validation logic (checks if email is VIT email)
    if (!email.endsWith("@vitstudent.ac.in")) {
      alert("Please use your VIT email ID"); // Browser API (alert)
      return;
    }

    // LocalStorage: saving user session (persistent data)
    localStorage.setItem("user", JSON.stringify({ email }));

    // Routing: navigate to home page after login
    navigate("/");
  };

  // JSX: UI structure of the component
  return (
    <div className="login-page"> {/* Styling using CSS class */}
      <div className="login-card"> {/* Styling */}

        <h1>Login</h1>

        {/* Input field (controlled component using state) */}
        <input
          type="email"
          placeholder="Enter your VIT email"
          value={email} // State value displayed in input
          onChange={(e) => setEmail(e.target.value)} // Updates state on typing
        />

        {/* Button with event handler */}
        <button onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}

export default Login; // Exporting component for use in routing