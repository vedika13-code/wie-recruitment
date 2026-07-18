"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { updateProfileAction, type ProfileFormInput } from "@/lib/recruitment/actions/profile";

type Props = {
  email: string;
  initial: Required<ProfileFormInput>;
  applicationClosed: boolean;
};

const FIELDS: { key: keyof ProfileFormInput; label: string; type?: string }[] = [
  { key: "name", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "regNo", label: "Registration No" },
  { key: "branch", label: "Branch" },
  { key: "specialization", label: "Specialization" },
  { key: "age", label: "Age", type: "number" },
];

const OPTIONAL_FIELDS: { key: keyof ProfileFormInput; label: string }[] = [
  { key: "githubUrl", label: "GitHub URL" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
  { key: "portfolioUrl", label: "Portfolio URL" },
];

const inputClass =
  "glass-card w-full rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 disabled:opacity-50";

export default function ProfileForm({ email, initial, applicationClosed }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Required<ProfileFormInput>>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof ProfileFormInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await updateProfileAction(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-300">
        Details
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={email} placeholder="VIT Email" disabled className={inputClass} />
        {FIELDS.map(({ key, label, type }) => (
          <input
            key={key}
            type={type ?? "text"}
            value={form[key]}
            placeholder={label}
            onChange={(e) => handleChange(key, e.target.value)}
            disabled={applicationClosed}
            className={inputClass}
          />
        ))}
        <select
          value={form.residenceType}
          onChange={(e) => handleChange("residenceType", e.target.value)}
          disabled={applicationClosed}
          className={inputClass}
        >
          <option value="">Select residence type</option>
          <option>Hosteller</option>
          <option>Day Scholar</option>
        </select>
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-purple-300">
        Profiles (optional)
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONAL_FIELDS.map(({ key, label }) => (
          <input
            key={key}
            value={form[key]}
            placeholder={label}
            onChange={(e) => handleChange(key, e.target.value)}
            disabled={applicationClosed}
            className={inputClass}
          />
        ))}
      </div>

      {applicationClosed && (
        <p className="mt-6 text-sm text-red-400">
          Applications are closed — profile editing is locked.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <Button type="submit" className="mt-8" disabled={applicationClosed || saving}>
        {saving ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
