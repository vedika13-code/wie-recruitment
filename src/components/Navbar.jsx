import { Link, useLocation, useNavigate } from "react-router-dom";//ROUTING->CHANGES URL->loads component->no page reload
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { logout, getMe } from "../api";

const ADMIN_ROLES = ["admin", "super_admin"];

function Navbar({ title }) {{/*component representing navbar displays title top left and other nav links,prop(receives data from parent)*/}
  const location = useLocation();//hook->routing concept, gives corrent url info
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    getMe().then((user) => setRole(user.role)).catch(() => setRole(null));
  }, []);

  const isActive = (path) => location.pathname === path ? "active" : "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>{title}</h2>{/*jsx to="/" → where to go*/}

      <div>{/*react styling*/}
        <Link className={isActive("/")} to="/">Home</Link>
        <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
        <Link className={isActive("/apply")} to="/apply">Apply</Link>
        <Link className={isActive("/domains-info")} to="/domains-info">Domains</Link>
        {ADMIN_ROLES.includes(role) && (
          <>
            <Link className={isActive("/admin")} to="/admin">Admin</Link>
            <Link className={isActive("/admin/task-config")} to="/admin/task-config">Task Config</Link>
          </>
        )}
        {role === "super_admin" && (
          <Link className={isActive("/admin/manage-admins")} to="/admin/manage-admins">Manage Admins</Link>
        )}
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

//  Props validation
Navbar.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Navbar;
//Parent sends:
//<Navbar title="WIE Recruitment" />
//Component renders:
//Title → "WIE Recruitment"
//Links → Home, Dashboard, Apply, Domains
//User clicks:
//Uses <Link> → navigates without reload
//useLocation() detects current path
//isActive():
//Adds "active" class to current page link