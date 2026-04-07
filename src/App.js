import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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

import Navbar from "./components/Navbar";

import "./styles/style.css";


// 🔐 Protected Route (WITH STATE + HOOKS)
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return user ? children : <Navigate to="/login" />;
};

// ✅ Props Validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


function App() {
  // ✅ Example global state
  const [appName] = useState("IEEE WIE Recruitment Portal");

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* HOME */}
        <Route path="/" element={
          <ProtectedRoute>
            <>
              <Navbar title={appName} />
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

        {/* TASK QUESTIONS */}
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

export default App;