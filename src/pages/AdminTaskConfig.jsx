import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getDomainTaskConfig, setDomainTaskConfig } from "../api";

const ARTIFACT_TYPES = ["none", "code_link", "code_file", "blog_link", "design_file"];

function DomainConfigRow({ config, onSave }) {
  const [artifactType, setArtifactType] = useState(config.artifactType);
  const [artifactLabel, setArtifactLabel] = useState(config.artifactLabel || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(config.domainName, artifactType, artifactLabel);
    setSaving(false);
  };

  return (
    <tr>
      <td>{config.domainName}</td>
      <td>
        <select value={artifactType} onChange={(e) => setArtifactType(e.target.value)}>
          {ARTIFACT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </td>
      <td>
        <input
          value={artifactLabel}
          onChange={(e) => setArtifactLabel(e.target.value)}
          placeholder="Label shown to applicants"
          disabled={artifactType === "none"}
        />
      </td>
      <td>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
}

DomainConfigRow.propTypes = {
  config: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

function AdminTaskConfig() {
  const [configs, setConfigs] = useState([]);
  const [message, setMessage] = useState("");

  const load = () => getDomainTaskConfig().then(setConfigs);

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (domainName, artifactType, artifactLabel) => {
    await setDomainTaskConfig(domainName, { artifactType, artifactLabel: artifactLabel || null });
    setMessage(`${domainName} updated.`);
    load();
  };

  return (
    <div>
      <h1>Admin — Task Config</h1>
      <p>Turn a domain&apos;s work-artifact requirement on/off and pick its type, for the active cycle.</p>
      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Artifact type</th>
            <th>Label</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {configs.map((c) => (
            <DomainConfigRow key={c.domainId} config={c} onSave={handleSave} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTaskConfig;
