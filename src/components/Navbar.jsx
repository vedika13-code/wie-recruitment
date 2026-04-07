import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

function Navbar({ title }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <h2>{title}</h2>

      <div>
        <Link className={isActive("/")} to="/">Home</Link>
        <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
        <Link className={isActive("/apply")} to="/apply">Apply</Link>
        <Link className={isActive("/domains-info")} to="/domains-info">Domains</Link>
      </div>
    </nav>
  );
}

// ✅ Props validation
Navbar.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Navbar;