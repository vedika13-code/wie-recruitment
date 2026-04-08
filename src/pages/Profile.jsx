import { useState, useEffect } from "react"; // Hooks: state + lifecycle
import { useNavigate } from "react-router-dom"; // Hook for routing/navigation

function Profile() { // Functional Component (Profile page)
  const navigate = useNavigate(); // Hook: used to navigate between routes

  // State: stores entire form data as an object
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reg: "",
    branch: "",
    specialization: "",
    age: "",
    type: "",
    github: ""
  });

  // useEffect: runs once when component loads (autofill from localStorage)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profile")); // LocalStorage read
    if (saved) setForm(saved); // Update state → autofill form
  }, []);

  // Event handling: updates state when user types
  const handleChange = (e) => {
    setForm({ 
      ...form, // Spread operator (keeps existing values)
      [e.target.name]: e.target.value // Updates only changed field
    });
  };

  // Event handling: form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload (important in forms)

    // Validation: check VIT email
    if (!form.email.endsWith("@vitstudent.ac.in")) {
      alert("Enter valid VIT email ID"); // Browser API
      return;
    }

    // LocalStorage: save form data
    localStorage.setItem("profile", JSON.stringify(form));

    alert("Profile Saved"); // Feedback

    navigate("/dashboard"); // Routing after submit
  };

  // Event handling: clear all stored data
  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "This will delete your profile and selected domains. Continue?"
    );

    if (confirmClear) {
      // Remove stored data (localStorage)
      localStorage.removeItem("profile");
      localStorage.removeItem("domains");
      localStorage.removeItem("user");

      alert("Profile & data cleared");

      navigate("/login"); // Redirect to login
      window.location.reload(); // Force reload
    }
  };

  // JSX: UI structure
  return (
    <div className="profile-page"> {/* Styling */}

      {/* Navigation using click */}
      <div className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Dashboard
      </div>

      {/* Static JSX */}
      <h1 className="profile-title">PROFILE</h1>

      {/* Form handling */}
      <form onSubmit={handleSubmit}> {/* Form event */}

        <div className="profile-card">
          <h2>DETAILS</h2>

          <div className="form-grid">

            {/* Controlled inputs (state-driven inputs) */}
            <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} />
            <input name="email" value={form.email} placeholder="VIT Email" onChange={handleChange} />
            <input name="phone" value={form.phone} placeholder="Phone" onChange={handleChange} />
            <input name="reg" value={form.reg} placeholder="Registration No" onChange={handleChange} />
            <input name="branch" value={form.branch} placeholder="Branch" onChange={handleChange} />
            <input name="specialization" value={form.specialization} placeholder="Specialization" onChange={handleChange} />
            <input name="age" value={form.age} placeholder="Age" onChange={handleChange} />

            {/* Select input (also controlled) */}
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Select</option>
              <option>Hosteller</option>
              <option>Day Scholar</option>
            </select>

          </div>
        </div>

        <div className="profile-card">
          <h2>PROFILES</h2>

          {/* Controlled input */}
          <input
            name="github"
            value={form.github}
            placeholder="GitHub URL"
            onChange={handleChange}
          />
        </div>

        {/* Submit button */}
        <button className="save-btn">Save Profile</button>

        {/* Clear button with inline styling */}
        <button
          type="button"
          onClick={handleClearAll} // Event handling
          style={{ // Inline styling
            marginTop: "15px",
            padding: "12px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Clear Profile & Domains
        </button>

      </form>
    </div>
  );
}

export default Profile; // Export component