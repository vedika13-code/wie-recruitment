import { Link, useLocation } from "react-router-dom";//ROUTING->CHANGES URL->loads component->no page reload
import PropTypes from "prop-types";

function Navbar({ title }) {{/*component representing navbar displays title top left and other nav links,prop(receives data from parent)*/}
  const location = useLocation();//hook->routing concept, gives corrent url info

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <h2>{title}</h2>{/*jsx to="/" → where to go*/}

      <div>{/*react styling*/}
        <Link className={isActive("/")} to="/">Home</Link>
        <Link className={isActive("/dashboard")} to="/dashboard">Dashboard</Link>
        <Link className={isActive("/apply")} to="/apply">Apply</Link>
        <Link className={isActive("/domains-info")} to="/domains-info">Domains</Link>
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