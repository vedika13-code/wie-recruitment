import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, devLogin } from "../api";

const DEV_LOGIN_ENABLED = process.env.REACT_APP_ENABLE_DEV_LOGIN === "true";

function DevLoginForm({ onError }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("applicant");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError("");
    try {
      await devLogin(email, role);
      navigate("/");
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginTop: "20px", padding: "12px", border: "1px dashed #999" }}
    >
      <p style={{ fontWeight: "bold" }}>Dev login (local only)</p>
      <input
        type="email"
        placeholder="any@vitstudent.ac.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="applicant">applicant</option>
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
      <button type="submit">Dev Login</button>
    </form>
  );
}

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

        {DEV_LOGIN_ENABLED && <DevLoginForm onError={setError} />}
      </div>
    </div>
  );
}

export default Login;
