import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api";

function Profile() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    regNo: "",
    branch: "",
    specialization: "",
    age: "",
    residenceType: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    getProfile().then((profile) => {
      setEmail(profile.email);
      setForm((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.keys(prev).map((key) => [key, profile[key] ?? ""])
        ),
      }));
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    alert("Profile Saved");
    navigate("/dashboard");
  };

  return (
    <div className="profile-page">
      <div className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Dashboard
      </div>

      <h1 className="profile-title">PROFILE</h1>

      <form onSubmit={handleSubmit}>
        <div className="profile-card">
          <h2>DETAILS</h2>

          <div className="form-grid">
            <input value={email} placeholder="VIT Email" disabled />
            <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} />
            <input name="phone" value={form.phone} placeholder="Phone" onChange={handleChange} />
            <input name="regNo" value={form.regNo} placeholder="Registration No" onChange={handleChange} />
            <input name="branch" value={form.branch} placeholder="Branch" onChange={handleChange} />
            <input
              name="specialization"
              value={form.specialization}
              placeholder="Specialization"
              onChange={handleChange}
            />
            <input name="age" type="number" value={form.age} placeholder="Age" onChange={handleChange} />

            <select name="residenceType" value={form.residenceType} onChange={handleChange}>
              <option value="">Select</option>
              <option>Hosteller</option>
              <option>Day Scholar</option>
            </select>
          </div>
        </div>

        <div className="profile-card">
          <h2>PROFILES (optional)</h2>

          <input
            name="githubUrl"
            value={form.githubUrl}
            placeholder="GitHub URL"
            onChange={handleChange}
          />
          <input
            name="linkedinUrl"
            value={form.linkedinUrl}
            placeholder="LinkedIn URL"
            onChange={handleChange}
          />
          <input
            name="portfolioUrl"
            value={form.portfolioUrl}
            placeholder="Portfolio URL"
            onChange={handleChange}
          />
        </div>

        <button className="save-btn">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile;
