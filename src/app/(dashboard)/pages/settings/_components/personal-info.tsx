"use client";

import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useState, useEffect } from "react";

interface CompanySettings {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

export function PersonalInfoForm() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data.data);
      setFormData({
        name: data.data.name || "",
        code: data.data.code || "",
        email: data.data.email || "",
        phone: data.data.phone || "",
        website: data.data.website || "",
        address: data.data.address || "",
        description: data.data.description || "",
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const result = await response.json();
      setSettings(result.data);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <ShowcaseSection title="Company Information" className="!p-7">
        <div className="text-center">Loading...</div>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection title="Company Information" className="!p-7">
      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="name"
            label="Company Name"
            placeholder="Enter company name"
            value={formData.name}
            handleChange={handleChange}
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
            required
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="code"
            label="Company Code"
            placeholder="CSR-001"
            value={formData.code}
            handleChange={handleChange}
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
            required
          />
        </div>

        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="email"
            name="email"
            label="Email Address"
            placeholder="company@example.com"
            value={formData.email}
            handleChange={handleChange}
            icon={<EmailIcon />}
            iconPosition="left"
            height="sm"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phone"
            label="Phone Number"
            placeholder="+62 123 4567 890"
            value={formData.phone}
            handleChange={handleChange}
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="text"
          name="website"
          label="Website"
          placeholder="https://www.company.com"
          value={formData.website}
          handleChange={handleChange}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <InputGroup
          className="mb-5.5"
          type="text"
          name="address"
          label="Address"
          placeholder="Company address"
          value={formData.address}
          handleChange={handleChange}
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <TextAreaGroup
          className="mb-5.5"
          label="Description"
          name="description"
          placeholder="Write company description here"
          icon={<PencilSquareIcon />}
          value={formData.description}
          onChange={handleChange}
        />

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
            onClick={() => loadSettings()}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
