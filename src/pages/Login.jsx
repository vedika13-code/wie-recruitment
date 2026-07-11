import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../api";

function Login() {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      setError("");
      try {
        await loginWithGoogle(response.credential);
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    };

    // The GIS script tag is async/defer, so it may not be loaded yet on mount.
    let cancelled = false;
    const tryInit = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
      });
    };
    tryInit();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <p>Sign in with your VIT Google account.</p>

        <div ref={buttonRef} />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
