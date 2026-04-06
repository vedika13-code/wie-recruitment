import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Domain from "./pages/Domain";
import Tasks from "./pages/Tasks";
import TaskQuestions from "./pages/TaskQuestions";
import DomainInfo from "./pages/DomainInfo";
import Interview from "./pages/Interview";
import Login from "./pages/Login";
import Apply from "./pages/Apply"; // ✅ IMPORTANT

import Navbar from "./components/Navbar";

import "./styles/style.css";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* HOME */}
        <Route path="/" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        } />

        {/* APPLY */}
        <Route path="/apply" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Apply />
            </>
          </ProtectedRoute>
        } />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        } />

        {/* PROFILE */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Profile />
            </>
          </ProtectedRoute>
        } />

        {/* DOMAIN SELECTION */}
        <Route path="/domain" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Domain />
            </>
          </ProtectedRoute>
        } />

        {/* TASKS */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Tasks />
            </>
          </ProtectedRoute>
        } />

        {/* TASK QUESTIONS */}
        <Route path="/tasks/:domain" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <TaskQuestions />
            </>
          </ProtectedRoute>
        } />

        {/* DOMAIN INFO */}
        <Route path="/domains-info" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <DomainInfo />
            </>
          </ProtectedRoute>
        } />

        {/* INTERVIEW */}
        <Route path="/interview" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Interview />
            </>
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;