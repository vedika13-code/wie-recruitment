import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Routing components
import { useState, useEffect } from "react"; // Hooks: state + lifecycle
import PropTypes from "prop-types"; // Props validation

// Importing pages (components)
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Domain from "./pages/Domain";
import Tasks from "./pages/Tasks";
import TaskQuestions from "./pages/TaskQuestions";
import DomainInfo from "./pages/DomainInfo";
import Interview from "./pages/Interview";
import Login from "./pages/Login";
import Apply from "./pages/Apply";

// Importing reusable component
import Navbar from "./components/Navbar";

// Importing CSS (styling)
import "./styles/style.css";


// Protected Route (Component + Hooks + Props)
const ProtectedRoute = ({ children }) => {

  // State: stores logged-in user
  const [user, setUser] = useState(null);

  // State: loading indicator
  const [loading, setLoading] = useState(true);

  // useEffect: runs once when component loads
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")); // LocalStorage read
    setUser(storedUser); // Update state
    setLoading(false); // Stop loading
  }, []);

  // Conditional rendering (loading state)
  if (loading) return <p>Loading...</p>;

  // Conditional routing (authentication check)
  return user ? children : <Navigate to="/login" />;
};

// Props validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


function App() { // Main App Component

  // Global state (app-level data)
  const [appName] = useState("IEEE WIE Recruitment Portal");

  return (

    // Router: wraps entire app (enables routing)
    <Router>

      {/* Routes container */}
      <Routes>

        {/* Public Route (no protection) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}

        {/* HOME */}
        <Route path="/" element={
          <ProtectedRoute> {/* Component + Props (children) */}
            <>
              <Navbar title={appName} /> {/* Props */}
              <Home />
            </>
          </ProtectedRoute>
        } />

        {/* APPLY */}
        <Route path="/apply" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Apply />
            </>
          </ProtectedRoute>
        } />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Dashboard />
            </>
          </ProtectedRoute>
        } />

        {/* PROFILE */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Profile />
            </>
          </ProtectedRoute>
        } />

        {/* DOMAIN */}
        <Route path="/domain" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Domain />
            </>
          </ProtectedRoute>
        } />

        {/* TASKS */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Tasks />
            </>
          </ProtectedRoute>
        } />

        {/* Dynamic Routing (URL parameter) */}
        <Route path="/tasks/:domain" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <TaskQuestions />
            </>
          </ProtectedRoute>
        } />

        {/* DOMAIN INFO */}
        <Route path="/domains-info" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <DomainInfo />
            </>
          </ProtectedRoute>
        } />

        {/* INTERVIEW */}
        <Route path="/interview" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
              <Interview />
            </>
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App; // Export main component