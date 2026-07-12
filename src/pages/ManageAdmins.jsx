import { useState, useEffect } from "react";
import { getAdmins, addAdmin, removeAdmin, getMe } from "../api";

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [selfId, setSelfId] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => getAdmins().then(setAdmins);

  useEffect(() => {
    load();
    getMe().then((me) => setSelfId(me.id));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await addAdmin(email, role);
      setMessage(`${email} is now ${role}.`);
      setEmail("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    setError("");
    setMessage("");
    try {
      await removeAdmin(id);
      setMessage("Admin access removed.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-admins">
      <h1>Manage Admins</h1>
      <p>Add a new admin by college email — works even if they haven&apos;t signed in yet.</p>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="email"
          placeholder="email@vitstudent.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">admin</option>
          <option value="super_admin">super_admin</option>
        </select>
        <button type="submit">Add / Update</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <table style={{ marginTop: "16px" }}>
        <thead>
          <tr>
            <th>Email</th><th>Name</th><th>Role</th><th>Added by</th><th />
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.email}</td>
              <td>{a.name || "—"}</td>
              <td>{a.role}</td>
              <td>{a.addedBy || "—"}</td>
              <td>
                <button
                  type="button"
                  disabled={a.id === selfId}
                  onClick={() => handleRemove(a.id)}
                  title={a.id === selfId ? "You cannot remove your own access" : ""}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageAdmins;
