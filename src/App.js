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
import AdminDashboard from "./pages/AdminDashboard";
import AdminTaskConfig from "./pages/AdminTaskConfig";
import ManageAdmins from "./pages/ManageAdmins";

// Importing reusable component
import Navbar from "./components/Navbar";

// Importing CSS (styling)
import "./styles/style.css";

// Session lookup
import { getMe } from "./api";


// Protected Route (Component + Hooks + Props)
const ProtectedRoute = ({ children }) => {

  // State: stores logged-in user (from the backend session, not localStorage)
  const [user, setUser] = useState(null);

  // State: loading indicator
  const [loading, setLoading] = useState(true);

  // useEffect: runs once when component loads
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
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

const ADMIN_ROLES = ["admin", "super_admin"];

// Same session check as ProtectedRoute, plus a role check — a plain Applicant hitting
// an /admin/* URL gets redirected, not just blocked at the API (which also enforces
// this server-side; this is UI-side only, see server/src/routes/admin.js).
const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (!ADMIN_ROLES.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Stricter than AdminRoute — only super_admin, not admin. Matches the extra
// requireRole('super_admin') layered onto the admin-management endpoints server-side.
const SuperAdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "super_admin") return <Navigate to="/dashboard" />;
  return children;
};

SuperAdminRoute.propTypes = {
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

        {/* ADMIN */}
        <Route path="/admin" element={
          <AdminRoute>
            <>
              <Navbar title={appName} />
              <AdminDashboard />
            </>
          </AdminRoute>
        } />

        {/* ADMIN TASK CONFIG */}
        <Route path="/admin/task-config" element={
          <AdminRoute>
            <>
              <Navbar title={appName} />
              <AdminTaskConfig />
            </>
          </AdminRoute>
        } />

        {/* MANAGE ADMINS (Super Admin only) */}
        <Route path="/admin/manage-admins" element={
          <SuperAdminRoute>
            <>
              <Navbar title={appName} />
              <ManageAdmins />
            </>
          </SuperAdminRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App; // Export main component