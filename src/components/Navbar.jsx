import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>IEEE WIE</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/apply">Apply</Link>
        <Link to="/domains-info">Domains</Link>
      </div>
    </nav>
  );
}

export default Navbar;